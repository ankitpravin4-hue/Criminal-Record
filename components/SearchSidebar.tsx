"use client";

import { Search } from "lucide-react";
import { COMMUNITY_COLORS, TYPE_COLORS, TYPE_LABELS } from "@/lib/colors";
import { formatScore } from "@/lib/format";
import { useActiveCase, useAppStore } from "@/store/useAppStore";

export function SearchSidebar() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const selectedId = useAppStore((s) => s.selectedId);
  const selectEntity = useAppStore((s) => s.selectEntity);
  const logAction = useAppStore((s) => s.logAction);
  const analysis = useAppStore((s) => s.analysis);
  const active = useActiveCase();
  const entityById = Object.fromEntries(active.entities.map((e) => [e.id, e]));

  const q = searchQuery.trim().toLowerCase();
  const results = q
    ? active.entities
        .filter((e) =>
          [e.id, e.label, e.subtitle, e.type, e.notes].some((v) => v.toLowerCase().includes(q)),
        )
        .slice(0, 8)
    : [];

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-800 bg-ink-850/90">
      <div className="border-b border-slate-800 p-3">
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Find entity
        </label>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-2.5 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                selectEntity(results[0].id, { focus: true, log: true });
                void logAction("SEARCH", `Entity search: ${searchQuery}`);
              }
            }}
            placeholder="Person, phone, vehicle, place, org…"
            className="w-full rounded-md border border-slate-700 bg-ink-900 py-2 pl-8 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400/60"
          />
        </div>
        {results.length > 0 && (
          <ul className="mt-2 space-y-1">
            {results.map((entity) => (
              <li key={entity.id}>
                <button
                  type="button"
                  onClick={() => {
                    selectEntity(entity.id, { focus: true, log: true });
                    void logAction("SEARCH", `Entity search: ${searchQuery}`);
                  }}
                  className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-slate-800 ${
                    selectedId === entity.id ? "bg-slate-800" : ""
                  }`}
                >
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: TYPE_COLORS[entity.type] }}
                  />
                  <span>
                    <span className="block text-slate-100">{entity.label}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {entity.id} · {TYPE_LABELS[entity.type]}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Top influencers
          </h2>
          <span className="text-[10px] text-slate-600">by betweenness</span>
        </div>
        <ol className="space-y-1">
          {analysis.influencers.map((id, index) => {
            const entity = entityById[id];
            const metrics = analysis.metrics[id];
            if (!entity || !metrics) return null;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => selectEntity(id, { focus: true, log: true })}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-slate-800 ${
                    selectedId === id ? "bg-slate-800 ring-1 ring-cyan-400/30" : ""
                  }`}
                >
                  <span className="w-4 font-mono text-slate-500">{index + 1}</span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: TYPE_COLORS[entity.type] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-slate-100">{entity.label}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {entity.id} · {formatScore(metrics.betweenness)}
                    </span>
                  </span>
                  {metrics.flags.length > 0 && (
                    <span className="rounded border border-rose-400/30 px-1 font-mono text-[9px] uppercase text-rose-300">
                      flag
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 border-t border-slate-800 pt-4">
          <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Node types
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <li key={type} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
                {label}
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Cluster palette
          </h3>
          <div className="flex gap-1.5">
            {COMMUNITY_COLORS.slice(0, Math.max(analysis.communityCount, 3)).map((color) => (
              <span key={color} className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
