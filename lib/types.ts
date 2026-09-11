export type EntityType = "person" | "phone" | "vehicle" | "location" | "organization";
export type RelationType =
  | "call"
  | "transaction"
  | "co-location"
  | "family"
  | "witness"
  | "surveillance"
  | "social";
export type ClusterHint = "harbor" | "remittance" | "fronts" | "bridge" | "custom";
export type Confidence = "high" | "medium" | "low";

export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  subtitle: string;
  notes: string;
  clusterHint: ClusterHint;
  meta: Record<string, string | number>;
}

export interface Relation {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  timestamp: string;
  description: string;
  confidence: Confidence;
  sourceRef: string;
  meta?: Record<string, string | number>;
}

export interface AuditSeedEvent {
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface NetworkDataset {
  disclaimer: string;
  caseId: string;
  title: string;
  generatedAt: string;
  entityCount: number;
  relationCount: number;
  entities: Entity[];
  relations: Relation[];
  auditSeed: AuditSeedEvent[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  prevHash: string;
  hash: string;
}

export type IntegrityStatus = "unchecked" | "valid" | "tampered";

export interface SuspiciousFlag {
  code: string;
  label: string;
  severity: "watch" | "high" | "critical";
  reason: string;
}

export interface NodeMetrics {
  degree: number;
  pagerank: number;
  betweenness: number;
  community: number;
  neighborCommunities: number;
  flags: SuspiciousFlag[];
  rankByBetweenness: number;
}

export interface GraphAnalysis {
  metrics: Record<string, NodeMetrics>;
  communityCount: number;
  modularity: number;
  influencers: string[];
}

export interface CaseRecord {
  id: string;
  title: string;
  description: string;
  dateOpened: string;
  entities: Entity[];
  relations: Relation[];
}

export interface FlashNotice {
  message: string;
  caseId: string;
}
