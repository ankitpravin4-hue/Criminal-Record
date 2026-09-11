import { dataset } from "@/lib/dataset";
import type { CaseRecord, Confidence, Entity, EntityType, Relation, RelationType } from "@/lib/types";

const TYPE_PREFIX: Record<EntityType, string> = {
  person: "P",
  phone: "PH",
  vehicle: "VH",
  location: "L",
  organization: "O",
};

export function localDateInput(value = new Date()) {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function nextCaseId(cases: CaseRecord[]) {
  let max = 0;
  for (const item of cases) {
    const match = /^SYN-(\d+)$/.exec(item.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `SYN-${String(max + 1).padStart(3, "0")}`;
}

export function nextEntityId(entities: Entity[], type: EntityType) {
  const prefix = TYPE_PREFIX[type];
  let max = 0;
  for (const entity of entities) {
    if (type === "person" && entity.id.startsWith("PH")) continue;
    if (!entity.id.startsWith(prefix)) continue;
    const n = Number.parseInt(entity.id.slice(prefix.length), 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export function nextRelationId(relations: Relation[]) {
  let max = 0;
  for (const rel of relations) {
    const match = /^E(\d+)$/.exec(rel.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `E${String(max + 1).padStart(3, "0")}`;
}

function inferConfidence(type: string): Confidence {
  if (type === "transaction") return "high";
  if (type === "call" || type === "family") return "medium";
  return "low";
}

export function buildSeedCase(): CaseRecord {
  return {
    id: "SYN-001",
    title: dataset.title,
    description:
      "Seeded synthetic demo case (Operation Tide Ledger). CASE STUDY DATA — NOT REAL PERSONS.",
    dateOpened: "2026-03-02",
    entities: dataset.entities.map((entity) => ({
      ...entity,
      notes: String(entity.meta?.notes ?? entity.subtitle ?? ""),
      clusterHint: entity.clusterHint,
    })),
    relations: dataset.relations.map((rel) => ({
      ...rel,
      type: rel.type as RelationType,
      description: String(rel.meta?.note ?? `${rel.type} link (seeded synthetic)`),
      confidence: inferConfidence(rel.type),
      sourceRef: "Seeded case file GS-DEMO-2026-041",
    })),
  };
}

export function emptyCase(id: string, title: string, description: string, dateOpened: string): CaseRecord {
  return { id, title, description, dateOpened, entities: [], relations: [] };
}
