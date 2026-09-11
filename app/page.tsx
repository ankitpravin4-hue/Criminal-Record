import Link from "next/link";
import { ArrowRight, Check, LockKeyhole, ScanSearch, ShieldCheck, TimerReset } from "lucide-react";
import { BriefingGraph } from "@/components/BriefingGraph";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const pipeline = [
  { step: "01", label: "Ingest", detail: "CDRs · FIRs · ledgers", value: "12.4k records", icon: ScanSearch },
  { step: "02", label: "Resolve", detail: "Entity + relation extraction", value: "98.7% confidence", icon: Check },
  { step: "03", label: "Analyze", detail: "Centrality · communities · rules", value: "6 cells found", icon: TimerReset },
  { step: "04", label: "Prove", detail: "Tamper-evident investigator trail", value: "0 gaps detected", icon: LockKeyhole },
];

export default function LandingPage() {
  return (
    <main>
      <DisclaimerBanner />
      <section className="relative overflow-hidden border-b border-slate-800/80">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-45" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
          <div>
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/90">
              <span className="h-px w-8 bg-cyan-400" /> Case intelligence / briefing 001
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-slate-50 sm:text-6xl">
              The network is the evidence.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-8 text-slate-300">
              GraphSentry turns disconnected case material into a living map of people, money, and influence — then preserves the trail behind every conclusion.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-semibold text-ink-950 shadow-glow transition hover:bg-cyan-300">
                Open live case <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="rounded-md border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500">
                Read system notes
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <span><i className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />Synthetic case active</span>
              <span>Updated 14:32:08 UTC</span>
            </div>
          </div>
          <div className="relative min-h-[380px] overflow-hidden rounded-xl border border-slate-700/80 bg-[#070b14] shadow-panel lg:min-h-[470px]">
            <div className="absolute left-4 top-4 z-10 rounded border border-slate-700 bg-[#0b1220]/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 backdrop-blur">
              <span className="text-cyan-300">CASE-047</span> / network preview
            </div>
            <div className="absolute right-4 top-4 z-10 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
              47 entities<br /><span className="text-amber-300">6 communities</span>
            </div>
            <BriefingGraph />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#070b14] to-transparent" />
            <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Betweenness view / all relations</div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800/80 bg-ink-850/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">Evidence pipeline</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">From raw signal to defensible insight.</h2></div>
            <p className="hidden max-w-xs text-right text-xs leading-5 text-slate-500 sm:block">A deterministic path from ingestion to an auditable investigator decision.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-slate-800 bg-slate-800 md:grid-cols-4">
            {pipeline.map((item, index) => {
              const Icon = item.icon;
              return <article key={item.step} className="relative bg-ink-900 p-5 transition hover:bg-[#111a2b]">
                {index < pipeline.length - 1 && <span className="absolute right-0 top-8 hidden h-px w-5 bg-cyan-400/50 md:block" />}
                <div className="flex items-center justify-between"><span className="font-mono text-xs text-slate-600">{item.step}</span><Icon size={16} className="text-cyan-300" /></div>
                <h3 className="mt-8 text-base font-semibold text-slate-100">{item.label}</h3>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{item.detail}</p>
                <p className="mt-5 border-t border-slate-800 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-200">{item.value}</p>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">Analyst note / 04</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">Structure reveals what volume conceals.</h2><p className="mt-4 text-sm leading-6 text-slate-400">A graph does not replace investigative judgment. It gives that judgment a shared surface, a ranked set of leads, and a record that can be checked later.</p></div>
          <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-ink-900">
            <div className="grid gap-2 p-5 sm:grid-cols-[150px_1fr]"><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-300">Why graphs</span><p className="text-sm leading-6 text-slate-400">Betweenness centrality surfaces the broker stitching otherwise separate cells together — not just the loudest caller.</p></div>
            <div className="grid gap-2 p-5 sm:grid-cols-[150px_1fr]"><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-300">Why communities</span><p className="text-sm leading-6 text-slate-400">Louvain clustering gives an investigator a readable operational shape: logistics, remittance, fronts, and bridges.</p></div>
            <div className="grid gap-2 p-5 sm:grid-cols-[150px_1fr]"><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-300">Why the chain</span><p className="text-sm leading-6 text-slate-400">Every search, node view, and export is SHA-256 chained to the previous row. Change a line and integrity verification fails.</p></div>
          </div>
        </div>
        <div className="mt-12 flex items-center gap-2 border-t border-slate-800 pt-5 text-xs text-slate-500"><ShieldCheck size={15} className="text-cyan-300" /> GraphSentry is a demonstrator using synthetic data. It is not a production law-enforcement system.</div>
      </section>
    </main>
  );
}
