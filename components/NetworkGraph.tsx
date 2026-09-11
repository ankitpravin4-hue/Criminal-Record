"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods, type NodeObject } from "react-force-graph-2d";
import { COMMUNITY_COLORS, RELATION_COLORS, TYPE_COLORS } from "@/lib/colors";
import { neighborsOf } from "@/lib/graph";
import { useActiveCase, useAppStore } from "@/store/useAppStore";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  community: number;
  val: number;
}

interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

type FGNode = NodeObject<GraphNode>;

export function NetworkGraph() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(undefined);
  const [size, setSize] = useState({ w: 640, h: 520 });

  const selectedId = useAppStore((s) => s.selectedId);
  const colorByCommunity = useAppStore((s) => s.colorByCommunity);
  const focusRequest = useAppStore((s) => s.focusRequest);
  const selectEntity = useAppStore((s) => s.selectEntity);
  const analysis = useAppStore((s) => s.analysis);
  const graphEpoch = useAppStore((s) => s.graphEpoch);
  const active = useActiveCase();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = active.entities.map((entity) => {
      const m = analysis.metrics[entity.id];
      const val = 3 + Math.min(18, (m?.betweenness ?? 0) * 80 + (m?.degree ?? 1) * 0.45);
      return {
        id: entity.id,
        label: entity.label,
        type: entity.type,
        community: m?.community ?? 0,
        val,
      };
    });
    const links: GraphLink[] = active.relations.map((rel) => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: rel.type,
    }));
    return { nodes, links };
  }, [active.entities, active.relations, analysis.metrics, graphEpoch]);

  const highlight = useMemo(() => {
    if (!selectedId) return null;
    return neighborsOf(active.relations, selectedId);
  }, [selectedId, active.relations]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const charge = fg.d3Force("charge");
    if (charge && typeof charge.strength === "function") {
      charge.strength(-220);
    }
    const link = fg.d3Force("link");
    if (link && typeof link.distance === "function") {
      link.distance(46);
    }
    if (graphEpoch > 0) fg.d3ReheatSimulation();
  }, [size.w, size.h, graphEpoch]);

  useEffect(() => {
    if (!focusRequest || !fgRef.current) return;
    const node = graphData.nodes.find((n) => n.id === focusRequest.id) as FGNode | undefined;
    if (!node || typeof node.x !== "number" || typeof node.y !== "number") return;
    fgRef.current.centerAt(node.x, node.y, 700);
    fgRef.current.zoom(2.2, 700);
  }, [focusRequest, graphData.nodes]);

  const nodeColor = useCallback(
    (node: FGNode) => {
      const id = String(node.id);
      const base = colorByCommunity
        ? COMMUNITY_COLORS[(node.community ?? 0) % COMMUNITY_COLORS.length]
        : TYPE_COLORS[node.type] ?? "#94a3b8";
      if (!highlight) return base;
      return highlight.nodeIds.has(id) ? base : "#1e293b";
    },
    [colorByCommunity, highlight],
  );

  const paintNode = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const id = String(node.id);
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = Math.sqrt(node.val ?? 4) * 2.1;
      const isSelected = selectedId === id;
      const isNeighbor = highlight?.nodeIds.has(id) ?? true;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor(node);
      ctx.globalAlpha = !highlight || isNeighbor ? 1 : 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;
      if (isSelected) {
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.4 / Math.max(globalScale * 0.6, 0.6);
        ctx.stroke();
      }
      const label = node.label ?? id;
      const fontSize = Math.max(10 / globalScale, 2.8);
      ctx.font = `${fontSize}px IBM Plex Sans, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isNeighbor ? "#e2e8f0" : "#475569";
      if (!highlight || isNeighbor || isSelected) {
        ctx.fillText(label, x, y + r + 1.5);
      }
    },
    [highlight, nodeColor, selectedId],
  );

  const paintPointer = useCallback((node: FGNode, color: string, ctx: CanvasRenderingContext2D) => {
    const r = Math.sqrt(node.val ?? 4) * 2.4;
    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  if (active.entities.length === 0) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center bg-[#070b14] px-6 text-center text-sm text-slate-500">
        This case has no entities yet. Add people, phones, or locations in Case builder.
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative h-full min-h-[420px] w-full overflow-hidden bg-[#070b14]">
      <ForceGraph2D<GraphNode, GraphLink>
        ref={fgRef}
        width={size.w}
        height={size.h}
        graphData={graphData}
        backgroundColor="#070b14"
        nodeRelSize={5}
        nodeVal="val"
        nodeLabel={(n) => `${n.label} (${n.id})`}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={paintPointer}
        linkColor={(l) => {
          const sid = typeof l.source === "object" ? String((l.source as FGNode).id) : String(l.source);
          const tid = typeof l.target === "object" ? String((l.target as FGNode).id) : String(l.target);
          const active = !highlight || (highlight.nodeIds.has(sid) && highlight.nodeIds.has(tid));
          const base = RELATION_COLORS[l.type] ?? "#334155";
          return active ? base : "#0f172a";
        }}
        linkWidth={(l) => {
          const sid = typeof l.source === "object" ? String((l.source as FGNode).id) : String(l.source);
          const tid = typeof l.target === "object" ? String((l.target as FGNode).id) : String(l.target);
          const onPath = highlight && highlight.nodeIds.has(sid) && highlight.nodeIds.has(tid);
          return onPath ? 1.8 : 0.7;
        }}
        linkDirectionalParticles={(l) => (l.type === "transaction" ? 1 : 0)}
        linkDirectionalParticleWidth={1.6}
        linkDirectionalParticleColor={() => "#fbbf24"}
        linkDirectionalParticleSpeed={0.004}
        cooldownTicks={90}
        onNodeClick={(node) => selectEntity(String(node.id), { log: true })}
        onBackgroundClick={() => selectEntity(null, { log: false })}
      />
    </div>
  );
}
