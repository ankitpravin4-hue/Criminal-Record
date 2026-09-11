"use client";

import { SEVERITY_STYLES, TYPE_COLORS, TYPE_LABELS } from "@/lib/colors";
import { formatInr, formatScore } from "@/lib/format";
import { useActiveCase, useAppStore } from "@/store/useAppStore";

export function EntityDetail() {
  const selectedId = useAppStore((s) => s.selectedId);
  const selectEntity = useAppStore((s) => s.selectEntity);
  const logAction = useAppStore((s) => s.logAction);
  const analysis = useAppStore((s) => s.analysis);
  const active = useActiveCase();
  const entityById = Object.fromEntries(active.entities.map((e) => [e.id, e]));

  if (!selectedId) {
    return (
      <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-slate-800 bg-ink-850/90 p-4 text-sm text-slate-400">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Inspector</p>
        <h2 className="mt-2 text-base font-semibold text-slate-200">No entity selected</h2>
        <p className="mt-2 text-xs leading-relaxed">
          Click a node on the graph or pick an influencer. Direct neighbors will highlight, and
          any matching suspicion rules will appear here.
        </p>
      </aside>
    );
  }

  const entity = entityById[selectedId];
  const metrics = analysis.metrics[selectedId];
  if (!entity || !metrics) {
    return (
      <aside className="w-[320px] border-l border-slate-800 p-4 text-sm text-slate-400">
        Unknown entity.
      </aside>
    );
  }

  const connections = active.relations.filter(
    (rel) => rel.source === selectedId || rel.target === selectedId,
  );

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-800 bg-ink-850/90">
      <div className="border-b border-slate-800 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Inspector</p>
        <div className="mt-2 flex items-start gap-2">
          <span
            className="mt-1.5 h-2.5 w-2.5 rounded-full"
            style={{ background: TYPE_COLORS[entity.type] }}
          />
          <div>
            <h2 className="text-base font-semibold text-slate-50">{entity.label}</h2>
            <p className="font-mono text-xs text-slate-500">
              {entity.id} · {TYPE_LABELS[entity.type]}
            </p>
            <p className="mt-1 text-xs text-slate-400">{entity.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4">
        <Stat label="Connections" value={String(metrics.degree)} />
        <Stat label="Centrality rank" value={`#${metrics.rankByBetweenness}`} />
        <Stat label="Betweenness" value={formatScore(metrics.betweenness)} />
        <Stat label="PageRank" value={formatScore(metrics.pagerank, 4)} />
        <Stat label="Community" value={`C${metrics.community + 1}`} />
        <Stat label="Neighbor clusters" value={String(metrics.neighborCommunities)} />
      </div>

      <div className="px-4 pb-3">
        <h3 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Suspicious patterns
        </h3>
        {metrics.flags.length === 0 ? (
          <p className="rounded-md border border-slate-800 bg-ink-900 px-3 py-2 text-xs text-slate-500">
            No rule-based flags. Degree and community span are within case norms.
          </p>
        ) : (
          <ul className="space-y-2">
            {metrics.flags.map((flag) => (
              <li
                key={flag.code}
                className={`rounded-md border px-3 py-2 text-xs ${SEVERITY_STYLES[flag.severity]}`}
              >
                <p className="font-semibold">{flag.label}</p>
                <p className="mt-1 opacity-90">{flag.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {typeof entity.meta.notes === "string" && (
        <p className="px-4 pb-3 text-xs leading-relaxed text-slate-500">{entity.meta.notes}</p>
      )}

      <div className="flex-1 px-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Direct links
          </h3>
          <button
            type="button"
            onClick={() =>
              void logAction("EXPORT", `Exported neighborhood of ${entity.id} (synthetic)`)
            }
            className="rounded border border-slate-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-slate-400 hover:border-cyan-400/40 hover:text-cyan-200"
          >
            Log export
          </button>
        </div>
        <ul className="space-y-1">
          {connections.map((rel) => {
            const otherId = rel.source === selectedId ? rel.target : rel.source;
            const other = entityById[otherId];
            const amount = rel.meta?.amountInr;
            return (
              <li key={rel.id}>
                <button
                  type="button"
                  onClick={() => selectEntity(otherId, { focus: true, log: true })}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-slate-800"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-slate-200">{other?.label ?? otherId}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {rel.type}
                      {typeof amount === "number" ? ` · ${formatInr(amount)}` : ""}
                    </span>
                  </span>
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: TYPE_COLORS[other?.type ?? "person"] }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-ink-900 px-2.5 py-2">
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-sm text-slate-100">{value}</p>
    </div>
  );
}
