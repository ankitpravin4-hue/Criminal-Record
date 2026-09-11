import Link from "next/link";
import {
  ArrowRight,
  Binary,
  GitGraph,
  Radar,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const steps = [
  {
    icon: Binary,
    title: "Data in",
    body: "Call-detail records, FIRs, bank statements and field notes land as disconnected tables.",
  },
  {
    icon: ScanSearch,
    title: "NLP extraction",
    body: "Named entities and relations are pulled out — people, phones, places, organisations, money flows.",
  },
  {
    icon: GitGraph,
    title: "Graph analytics",
    body: "Centrality ranks brokers. Community detection reveals cells. Rules flag bridges and velocity spikes.",
  },
  {
    icon: Radar,
    title: "Investigator insights",
    body: "A living map, ranked influencers, and a hash-chained audit trail of every search and export.",
  },
];

export default function LandingPage() {
  return (
    <main>
      <DisclaimerBanner />
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/90">
            Smart India Hackathon · Law enforcement intelligence
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-6xl">
            Criminal networks hide in the links.{" "}
            <span className="text-cyan-300">GraphSentry</span> makes them visible.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Investigators drown in CDRs, ledgers and case files that never talk to each other.
            GraphSentry fuses those fragments into a force-directed case graph, ranks the people
            who actually hold the network together, and logs every investigative action in a
            tamper-evident hash chain.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-slate-400">
            Tagline: <span className="text-slate-200">See the network. Prove the trail.</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:bg-cyan-300"
            >
              View live demo
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-5 py-2.5 text-sm text-slate-200 hover:border-slate-500"
            >
              Demo vs production architecture
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-ink-850/50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="flex items-center gap-2 text-cyan-300">
            <ShieldCheck size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">How it works</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <article
                key={step.title}
                className="rounded-xl border border-slate-800 bg-ink-900 p-5 shadow-panel"
              >
                <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
                <step.icon className="mt-3 text-cyan-300" size={22} />
                <h3 className="mt-3 text-base font-semibold text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-14 sm:grid-cols-3">
          {[
            {
              k: "Why graphs",
              v: "A kingpin is rarely the loudest caller. Betweenness centrality finds the broker who stitches otherwise separate cells.",
            },
            {
              k: "Why communities",
              v: "Louvain clustering recolors the map into cells — harbor logistics, inland remittance, front companies — so structure is obvious in a two-minute walkthrough.",
            },
            {
              k: "Why a hash chain",
              v: "Every search, node view and export is SHA-256 chained to the previous row. Edit a line and Verify Integrity fails. That is tamper evidence without a blockchain network.",
            },
          ].map((card) => (
            <article key={card.k} className="rounded-xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-amber-200">{card.k}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.v}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
