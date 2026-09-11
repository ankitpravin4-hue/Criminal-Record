import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import betweennessCentrality from "graphology-metrics/centrality/betweenness";
import pagerank from "graphology-metrics/centrality/pagerank";
import type {
  Entity,
  GraphAnalysis,
  NodeMetrics,
  Relation,
  SuspiciousFlag,
} from "./types";

function buildGraph(entities: Entity[], relations: Relation[]) {
  const graph = new Graph({ type: "undirected", multi: false, allowSelfLoops: false });
  for (const entity of entities) {
    if (!graph.hasNode(entity.id)) {
      graph.addNode(entity.id, { type: entity.type, label: entity.label });
    }
  }
  for (const rel of relations) {
    if (!graph.hasNode(rel.source) || !graph.hasNode(rel.target)) continue;
    if (rel.source === rel.target) continue;
    if (graph.hasEdge(rel.source, rel.target)) continue;
    graph.addEdge(rel.source, rel.target, { type: rel.type, id: rel.id });
  }
  return graph;
}

function flagNode(
  id: string,
  entity: Entity | undefined,
  degree: number,
  betweenness: number,
  neighborCommunities: number,
  transactionDegree: number,
  callDegree: number,
  orgSpan: number,
): SuspiciousFlag[] {
  const flags: SuspiciousFlag[] = [];

  if (neighborCommunities >= 3) {
    flags.push({
      code: "BRIDGE_3PLUS",
      label: "Cross-cluster broker",
      severity: "critical",
      reason: `Directly links ${neighborCommunities} otherwise separate communities — a classic coordinator pattern.`,
    });
  } else if (neighborCommunities === 2 && betweenness > 0.08) {
    flags.push({
      code: "BRIDGE_2",
      label: "Inter-cluster bridge",
      severity: "high",
      reason: "High betweenness actor sitting on the cut between two communities.",
    });
  }

  if (transactionDegree >= 5) {
    flags.push({
      code: "TX_VELOCITY",
      label: "High transaction frequency",
      severity: "high",
      reason: `${transactionDegree} transaction edges — well above the case median.`,
    });
  }

  if (callDegree >= 6) {
    flags.push({
      code: "STAR_COMMS",
      label: "Star communicator",
      severity: "watch",
      reason: `${callDegree} call ties; unusually central in the communications subgraph.`,
    });
  }

  if (entity?.type === "organization" && orgSpan >= 2) {
    flags.push({
      code: "SHELL_NEXUS",
      label: "Multi-cluster shell",
      severity: "high",
      reason: `This organization is tied to people spanning ${orgSpan} communities.`,
    });
  }

  if (entity?.type === "phone" && neighborCommunities >= 2) {
    flags.push({
      code: "SHARED_HANDSET",
      label: "Shared / burner handset",
      severity: "high",
      reason: "The same number appears in more than one community.",
    });
  }

  if (entity?.type === "location" && neighborCommunities >= 3) {
    flags.push({
      code: "MEET_POINT",
      label: "Cross-network meet point",
      severity: "critical",
      reason: "Co-location site used by three or more communities.",
    });
  }

  if (degree >= 10 && !flags.some((f) => f.code.startsWith("BRIDGE"))) {
    flags.push({
      code: "DEGREE_HUB",
      label: "High-degree hub",
      severity: "watch",
      reason: `${degree} direct connections — a structural hub in the case graph.`,
    });
  }

  return flags;
}

export const EMPTY_ANALYSIS: GraphAnalysis = {
  metrics: {},
  communityCount: 0,
  modularity: 0,
  influencers: [],
};

export function analyzeGraph(entities: Entity[], relations: Relation[]): GraphAnalysis {
  if (entities.length === 0) return EMPTY_ANALYSIS;

  try {
    const graph = buildGraph(entities, relations);
  const entityById = new Map(entities.map((e) => [e.id, e]));

  const ranks = pagerank(graph, { getEdgeWeight: null });
  const betweenness = betweennessCentrality(graph, { normalized: true, getEdgeWeight: null });
  const detailed = louvain.detailed(graph, { getEdgeWeight: null, rng: () => 0.42 });
  const communities = detailed.communities as Record<string, number>;

  const neighborCommunityCount: Record<string, number> = {};
  const txDegree: Record<string, number> = {};
  const callDegree: Record<string, number> = {};

  graph.forEachNode((node) => {
    const comms = new Set<number>();
    let tx = 0;
    let calls = 0;
    graph.forEachEdge(node, (edge, attributes, source, target) => {
      const neighbor = source === node ? target : source;
      comms.add(communities[neighbor] ?? -1);
      const kind = (attributes as { type?: string }).type;
      if (kind === "transaction") tx += 1;
      if (kind === "call") calls += 1;
    });
    neighborCommunityCount[node] = comms.size;
    txDegree[node] = tx;
    callDegree[node] = calls;
  });

  const orgSpan: Record<string, number> = {};
  for (const entity of entities) {
    if (entity.type !== "organization") continue;
    const comms = new Set<number>();
    if (graph.hasNode(entity.id)) {
      graph.forEachNeighbor(entity.id, (neighbor) => {
        const n = entityById.get(neighbor);
        if (n?.type === "person") comms.add(communities[neighbor] ?? -1);
      });
    }
    orgSpan[entity.id] = comms.size;
  }

  const metrics: Record<string, NodeMetrics> = {};
  const ranked = [...graph.nodes()].sort((a, b) => (betweenness[b] ?? 0) - (betweenness[a] ?? 0));
  const rankIndex = new Map(ranked.map((id, i) => [id, i + 1]));

  graph.forEachNode((node) => {
    const entity = entityById.get(node);
    const degree = graph.degree(node);
    metrics[node] = {
      degree,
      pagerank: ranks[node] ?? 0,
      betweenness: betweenness[node] ?? 0,
      community: communities[node] ?? 0,
      neighborCommunities: neighborCommunityCount[node] ?? 0,
      flags: flagNode(
        node,
        entity,
        degree,
        betweenness[node] ?? 0,
        neighborCommunityCount[node] ?? 0,
        txDegree[node] ?? 0,
        callDegree[node] ?? 0,
        orgSpan[node] ?? 0,
      ),
      rankByBetweenness: rankIndex.get(node) ?? ranked.length,
    };
  });

  return {
    metrics,
    communityCount: detailed.count,
    modularity: detailed.modularity,
    influencers: ranked.slice(0, 8),
  };
  } catch {
    return EMPTY_ANALYSIS;
  }
}

export function neighborsOf(
  relations: Relation[],
  id: string,
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([id]);
  const edgeIds = new Set<string>();
  for (const rel of relations) {
    if (rel.source === id || rel.target === id) {
      nodeIds.add(rel.source);
      nodeIds.add(rel.target);
      edgeIds.add(rel.id);
    }
  }
  return { nodeIds, edgeIds };
}
