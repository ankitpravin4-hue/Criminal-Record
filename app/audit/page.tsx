"use client";

import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { GENESIS_HASH, shortenHash } from "@/lib/hash-chain";
import { formatStamp } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";

export default function AuditPage() {
  const auditLog = useAppStore((s) => s.auditLog);
  const integrity = useAppStore((s) => s.integrity);
  const brokenAt = useAppStore((s) => s.brokenAt);
  const chainReady = useAppStore((s) => s.chainReady);
  const verifyIntegrity = useAppStore((s) => s.verifyIntegrity);
  const tamperOldestSearch = useAppStore((s) => s.tamperOldestSearch);
  const restoreChain = useAppStore((s) => s.restoreChain);

  return (
    <main className="min-h-[calc(100vh-57px)]">
      <DisclaimerBanner />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300/80">
              Tamper-evident log
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50">Audit trail</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Each row&apos;s hash is <span className="font-mono text-slate-200">SHA-256(previous hash + row payload)</span>,
              computed in the browser with the Web Crypto API. Production would persist the same
              chain on Hyperledger Fabric — this demo proves the idea without a ledger network.
            </p>
            <p className="mt-2 font-mono text-[11px] text-slate-600">
              Genesis · {shortenHash(GENESIS_HASH, 12)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void verifyIntegrity()}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-cyan-300"
            >
              <ShieldCheck size={16} />
              Verify integrity
            </button>
            <button
              type="button"
              onClick={tamperOldestSearch}
              className="inline-flex items-center gap-2 rounded-md border border-rose-400/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-400/10"
            >
              <ShieldAlert size={16} />
              Simulate tamper
            </button>
            <button
              type="button"
              onClick={() => void restoreChain()}
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Rebuild chain
            </button>
          </div>
        </div>

        <div className="mt-5">
          {integrity === "valid" && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              <CheckCircle2 size={16} />
              Chain verified. Every hash matches the recomputed SHA-256 sequence.
            </div>
          )}
          {integrity === "tampered" && (
            <div className="flex items-center gap-2 rounded-md border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              <AlertTriangle size={16} />
              Tampered. Recompute failed at {brokenAt ?? "an unknown row"} — the payload no longer
              matches the stored hash.
            </div>
          )}
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-850 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Seq</th>
                <th className="px-3 py-2">Timestamp (IST)</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Detail</th>
                <th className="px-3 py-2">Hash</th>
              </tr>
            </thead>
            <tbody>
              {!chainReady && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    Sealing genesis block…
                  </td>
                </tr>
              )}
              {auditLog.map((row, i) => {
                const broken = integrity === "tampered" && brokenAt === row.id;
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-800 ${
                      broken ? "bg-rose-400/10" : i % 2 === 0 ? "bg-ink-900" : "bg-ink-850/40"
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{row.id}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-300">
                      {formatStamp(row.timestamp)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">{row.actor}</td>
                    <td className="px-3 py-2">
                      <span className="rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-cyan-200">
                        {row.action}
                      </span>
                    </td>
                    <td className="max-w-sm px-3 py-2 text-xs text-slate-300">{row.detail}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500" title={row.hash}>
                      {shortenHash(row.hash)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
