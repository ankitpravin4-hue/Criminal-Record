"use client";

import { create } from "zustand";
import { buildSeedCase, emptyCase, nextCaseId, nextEntityId, nextRelationId } from "@/lib/cases";
import { DEMO_ACTOR, dataset } from "@/lib/dataset";
import { analyzeGraph } from "@/lib/graph";
import { appendEntry, buildChain, verifyChain } from "@/lib/hash-chain";
import type {
  AuditEntry,
  CaseRecord,
  Confidence,
  Entity,
  EntityType,
  FlashNotice,
  GraphAnalysis,
  IntegrityStatus,
  Relation,
  RelationType,
} from "@/lib/types";

const seedCase = buildSeedCase();

interface FocusRequest {
  id: string;
  nonce: number;
}

interface AppState {
  cases: CaseRecord[];
  activeCaseId: string;
  analysis: GraphAnalysis;
  graphEpoch: number;
  flash: FlashNotice | null;
  selectedId: string | null;
  searchQuery: string;
  colorByCommunity: boolean;
  auditLog: AuditEntry[];
  integrity: IntegrityStatus;
  brokenAt: string | null;
  chainReady: boolean;
  focusRequest: FocusRequest | null;
  selectEntity: (id: string | null, opts?: { focus?: boolean; log?: boolean }) => void;
  setSearchQuery: (q: string) => void;
  toggleCommunity: () => void;
  initChain: () => Promise<void>;
  logAction: (action: string, detail: string) => Promise<void>;
  verifyIntegrity: () => Promise<void>;
  tamperOldestSearch: () => void;
  restoreChain: () => Promise<void>;
  selectCase: (id: string) => void;
  createCase: (input: { title: string; description: string; dateOpened: string }) => string | null;
  addEntity: (input: { type: EntityType; label: string; notes: string }) => Entity | null;
  updateEntity: (id: string, input: { type: EntityType; label: string; notes: string }) => boolean;
  removeEntity: (id: string) => boolean;
  addClue: (input: {
    source: string;
    target: string;
    type: RelationType;
    description: string;
    confidence: Confidence;
    sourceRef: string;
  }) => Relation | null;
  updateClue: (
    id: string,
    input: {
      source: string;
      target: string;
      type: RelationType;
      description: string;
      confidence: Confidence;
      sourceRef: string;
    },
  ) => boolean;
  removeClue: (id: string) => boolean;
  clearFlash: () => void;
}

function activeOf(cases: CaseRecord[], id: string) {
  return cases.find((item) => item.id === id) ?? cases[0];
}

function refreshGraph(cases: CaseRecord[], activeCaseId: string, extra: Partial<AppState> = {}) {
  const active = activeOf(cases, activeCaseId);
  return {
    cases,
    activeCaseId: active.id,
    analysis: analyzeGraph(active.entities, active.relations),
    ...extra,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  cases: [seedCase],
  activeCaseId: seedCase.id,
  analysis: analyzeGraph(seedCase.entities, seedCase.relations),
  graphEpoch: 0,
  flash: null,
  selectedId: null,
  searchQuery: "",
  colorByCommunity: false,
  auditLog: [],
  integrity: "unchecked",
  brokenAt: null,
  chainReady: false,
  focusRequest: null,

  selectEntity: (id, opts) => {
    set({ selectedId: id });
    if (id && opts?.focus) {
      set({ focusRequest: { id, nonce: Date.now() } });
    }
    if (id && opts?.log !== false) {
      const active = activeOf(get().cases, get().activeCaseId);
      const label = active.entities.find((e) => e.id === id)?.label ?? id;
      void get().logAction("NODE_VIEW", `Inspected ${id} ${label} (${active.id})`);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleCommunity: () => {
    const next = !get().colorByCommunity;
    set({ colorByCommunity: next });
    void get().logAction(
      "COMMUNITY_TOGGLE",
      next ? "Enabled Louvain community coloring" : "Restored type-based node coloring",
    );
  },

  initChain: async () => {
    if (get().chainReady) return;
    const chain = await buildChain(dataset.auditSeed);
    set({ auditLog: chain, chainReady: true, integrity: "unchecked", brokenAt: null });
  },

  logAction: async (action, detail) => {
    if (!get().chainReady) {
      await get().initChain();
    }
    const next = await appendEntry(get().auditLog, {
      actor: DEMO_ACTOR,
      action,
      detail,
    });
    set({ auditLog: next, integrity: "unchecked", brokenAt: null });
  },

  verifyIntegrity: async () => {
    const result = await verifyChain(get().auditLog);
    set({ integrity: result.status, brokenAt: result.brokenAt });
  },

  tamperOldestSearch: () => {
    const log = get().auditLog;
    const target = [...log].reverse().find((row) => row.action === "SEARCH") ?? log[Math.floor(log.length / 2)];
    if (!target) return;
    set({
      auditLog: log.map((row) =>
        row.id === target.id
          ? { ...row, detail: `${row.detail} [UNAUTHORISED EDIT]` }
          : row,
      ),
      integrity: "unchecked",
      brokenAt: null,
    });
  },

  restoreChain: async () => {
    const chain = await buildChain(dataset.auditSeed);
    set({ auditLog: chain, chainReady: true, integrity: "unchecked", brokenAt: null });
  },

  selectCase: (id) => {
    const found = get().cases.find((item) => item.id === id);
    if (!found) return;
    set({
      ...refreshGraph(get().cases, id, {
        selectedId: null,
        searchQuery: "",
        graphEpoch: get().graphEpoch + 1,
      }),
    });
  },

  createCase: (input) => {
    const title = input.title.trim();
    if (!title) return null;
    const id = nextCaseId(get().cases);
    const created = emptyCase(id, title, input.description.trim(), input.dateOpened);
    const cases = [...get().cases, created];
    set({
      ...refreshGraph(cases, id, {
        selectedId: null,
        searchQuery: "",
        graphEpoch: get().graphEpoch + 1,
        flash: { message: `Opened ${id} — ${title}`, caseId: id },
      }),
    });
    void get().logAction("CASE_CREATE", `Opened ${id} "${title}"`);
    return id;
  },

  addEntity: (input) => {
    const label = input.label.trim();
    if (!label) return null;
    const active = activeOf(get().cases, get().activeCaseId);
    const entity: Entity = {
      id: nextEntityId(active.entities, input.type),
      type: input.type,
      label,
      subtitle: input.notes.trim() || input.type,
      notes: input.notes.trim(),
      clusterHint: "custom",
      meta: { notes: input.notes.trim() },
    };
    const cases = get().cases.map((item) =>
      item.id === active.id ? { ...item, entities: [...item.entities, entity] } : item,
    );
    set({
      ...refreshGraph(cases, active.id, {
        graphEpoch: get().graphEpoch + 1,
        flash: { message: `Added entity ${entity.id} ${entity.label}`, caseId: active.id },
      }),
    });
    void get().logAction("ENTITY_ADD", `${active.id}: added ${entity.type} ${entity.id} ${entity.label}`);
    return entity;
  },

  updateEntity: (id, input) => {
    const label = input.label.trim();
    if (!label) return false;
    const active = activeOf(get().cases, get().activeCaseId);
    if (!active.entities.some((e) => e.id === id)) return false;
    const cases = get().cases.map((item) =>
      item.id === active.id
        ? {
            ...item,
            entities: item.entities.map((entity) =>
              entity.id === id
                ? {
                    ...entity,
                    type: input.type,
                    label,
                    notes: input.notes.trim(),
                    subtitle: input.notes.trim() || entity.subtitle,
                    meta: { ...entity.meta, notes: input.notes.trim() },
                  }
                : entity,
            ),
          }
        : item,
    );
    set({
      ...refreshGraph(cases, active.id, {
        graphEpoch: get().graphEpoch + 1,
        flash: { message: `Updated entity ${id}`, caseId: active.id },
      }),
    });
    void get().logAction("ENTITY_EDIT", `${active.id}: edited ${id} ${label}`);
    return true;
  },

  removeEntity: (id) => {
    const active = activeOf(get().cases, get().activeCaseId);
    const entity = active.entities.find((e) => e.id === id);
    if (!entity) return false;
    const cases = get().cases.map((item) =>
      item.id === active.id
        ? {
            ...item,
            entities: item.entities.filter((e) => e.id !== id),
            relations: item.relations.filter((rel) => rel.source !== id && rel.target !== id),
          }
        : item,
    );
    set({
      ...refreshGraph(cases, active.id, {
        selectedId: get().selectedId === id ? null : get().selectedId,
        graphEpoch: get().graphEpoch + 1,
        flash: { message: `Removed entity ${id} ${entity.label}`, caseId: active.id },
      }),
    });
    void get().logAction("ENTITY_REMOVE", `${active.id}: removed ${id} ${entity.label}`);
    return true;
  },

  addClue: (input) => {
    if (input.source === input.target) return null;
    const active = activeOf(get().cases, get().activeCaseId);
    const ids = new Set(active.entities.map((e) => e.id));
    if (!ids.has(input.source) || !ids.has(input.target)) return null;
    const clue: Relation = {
      id: nextRelationId(active.relations),
      source: input.source,
      target: input.target,
      type: input.type,
      timestamp: new Date().toISOString(),
      description: input.description.trim(),
      confidence: input.confidence,
      sourceRef: input.sourceRef.trim(),
    };
    const cases = get().cases.map((item) =>
      item.id === active.id ? { ...item, relations: [...item.relations, clue] } : item,
    );
    set({
      ...refreshGraph(cases, active.id, {
        graphEpoch: get().graphEpoch + 1,
        flash: { message: `Added clue ${clue.id} (${clue.source} → ${clue.target})`, caseId: active.id },
      }),
    });
    void get().logAction(
      "CLUE_ADD",
      `${active.id}: clue ${clue.id} ${clue.source}→${clue.target} (${clue.type}, ${clue.confidence})`,
    );
    return clue;
  },

  updateClue: (id, input) => {
    if (input.source === input.target) return false;
    const active = activeOf(get().cases, get().activeCaseId);
    const ids = new Set(active.entities.map((e) => e.id));
    if (!ids.has(input.source) || !ids.has(input.target)) return false;
    if (!active.relations.some((rel) => rel.id === id)) return false;
    const cases = get().cases.map((item) =>
      item.id === active.id
        ? {
            ...item,
            relations: item.relations.map((rel) =>
              rel.id === id
                ? {
                    ...rel,
                    source: input.source,
                    target: input.target,
                    type: input.type,
                    description: input.description.trim(),
                    confidence: input.confidence,
                    sourceRef: input.sourceRef.trim(),
                  }
                : rel,
            ),
          }
        : item,
    );
    set({
      ...refreshGraph(cases, active.id, {
        graphEpoch: get().graphEpoch + 1,
        flash: { message: `Updated clue ${id}`, caseId: active.id },
      }),
    });
    void get().logAction("CLUE_EDIT", `${active.id}: edited clue ${id} ${input.source}→${input.target}`);
    return true;
  },

  removeClue: (id) => {
    const active = activeOf(get().cases, get().activeCaseId);
    const clue = active.relations.find((rel) => rel.id === id);
    if (!clue) return false;
    const cases = get().cases.map((item) =>
      item.id === active.id
        ? { ...item, relations: item.relations.filter((rel) => rel.id !== id) }
        : item,
    );
    set({
      ...refreshGraph(cases, active.id, {
        graphEpoch: get().graphEpoch + 1,
        flash: { message: `Removed clue ${id}`, caseId: active.id },
      }),
    });
    void get().logAction("CLUE_REMOVE", `${active.id}: removed clue ${id} ${clue.source}→${clue.target}`);
    return true;
  },

  clearFlash: () => set({ flash: null }),
}));

export function useActiveCase() {
  return useAppStore((s) => activeOf(s.cases, s.activeCaseId));
}
