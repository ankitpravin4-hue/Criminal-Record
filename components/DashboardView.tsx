"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { GitBranch } from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EntityDetail } from "@/components/EntityDetail";
import { SearchSidebar } from "@/components/SearchSidebar";
import { useActiveCase, useAppStore } from "@/store/useAppStore";

const NetworkGraph = dynamic(
  () => import("@/components/NetworkGraph").then((m) => m.NetworkGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Rendering force graph…
      </div>
    ),
  },
);

export function DashboardView({ initialCaseId }: { initialCaseId?: string }) {
  const colorByCommunity = useAppStore((s) => s.colorByCommunity);
  const toggleCommunity = useAppStore((s) => s.toggleCommunity);
  const analysis = useAppStore((s) => s.analysis);
  const selectCase = useAppStore((s) => s.selectCase);
  const active = useActiveCase();

  useEffect(() => {
    if (initialCaseId) selectCase(initialCaseId);
  }, [initialCaseId, selectCase]);

  const flagged = active.entities.filter((e) => (analysis.metrics[e.id]?.flags.length ?? 0) > 0)
    .length;

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <DisclaimerBanner compact />
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-ink-850 px-4 py-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
            {active.id}
          </p>
          <h1 className="text-sm font-semibold text-slate-100">{active.title}</h1>
        </div>
        <div className="hidden items-center gap-4 font-mono text-[11px] text-slate-400 md:flex">
          <span>{active.entities.length} entities</span>
          <span>{active.relations.length} relations</span>
          <span>{analysis.communityCount} communities</span>
          <span className="text-rose-300">{flagged} flagged</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={colorByCommunity}
          onClick={toggleCommunity}
          className="flex items-center gap-2 rounded-md border border-slate-700 bg-ink-900 px-3 py-1.5 text-xs text-slate-200"
        >
          <GitBranch size={14} className="text-cyan-300" />
          Community clusters
          <span
            className={`relative h-5 w-9 rounded-full transition ${
              colorByCommunity ? "bg-cyan-400" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                colorByCommunity ? "left-4" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </div>
      <div className="flex min-h-0 flex-1">
        <SearchSidebar />
        <div className="relative min-w-0 flex-1">
          <NetworkGraph />
          <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-slate-600">
            Drag nodes · scroll to zoom · click a hub to isolate its neighborhood
          </p>
        </div>
        <EntityDetail />
      </div>
    </div>
  );
}
