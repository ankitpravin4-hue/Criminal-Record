import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const rows = [
  {
    capability: "Entity & relation extraction",
    demo: "Pre-seeded synthetic JSON produced by scripts/generate-seed.ts. No live NLP.",
    production:
      "spaCy / Indic NER over FIRs, CDR dumps, bank statements and OSINT. Human-in-the-loop review before a node is committed.",
  },
  {
    capability: "Graph store",
    demo: "In-memory graphology graph in the browser. Dataset is a static file.",
    production:
      "Neo4j (or a sovereign equivalent) with role-scoped subgraphs per case, plus change data capture into the warehouse.",
  },
  {
    capability: "Centrality & communities",
    demo: "PageRank, betweenness and Louvain from graphology-metrics / graphology-communities-louvain, computed client-side.",
    production:
      "Neo4j Graph Data Science: betweenness, PageRank, Louvain / Leiden at case and force-wide scale. Nightly materialised ranks.",
  },
  {
    capability: "Link prediction / missing ties",
    demo: "Deterministic suspicion rules (3+ community bridge, transaction velocity, shared handset, shell nexus).",
    production:
      "GraphSAGE or GAT trained on historical case graphs for link prediction and risk scoring. Rules remain as an explainable overlay.",
  },
  {
    capability: "Audit trail",
    demo: "SHA-256 hash chain via Web Crypto. Verify Integrity recomputes the chain. Simulate Tamper proves breakage.",
    production:
      "Hyperledger Fabric (or eSign / NIC ledger) with investigator identities, endorsement policies, and court-exportable proofs.",
  },
  {
    capability: "Identity & access",
    demo: "None. Single unauthenticated prototype.",
    production:
      "Government SSO / NIC, case-level ACLs, attribute-based redaction, air-gapped deploy option for sensitive units.",
  },
  {
    capability: "Visualisation",
    demo: "react-force-graph-2d force layout with type and community palettes.",
    production:
      "Same interaction model, backed by server-side sampling, time sliders over CDR windows, and geospatial layers.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <DisclaimerBanner />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-300/80">
          Judge notes
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-50">Architecture</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400">
          GraphSentry is a <span className="text-slate-200">hackathon prototype</span>. The live
          demo is deliberately light so it runs on a laptop with no credentials, no graph database
          and no model weights. The table below is the honest split: what you are clicking through
          today versus what a production deployment for an investigative unit would stand up.
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-850 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Capability</th>
                <th className="px-4 py-3">Simulated in this demo</th>
                <th className="px-4 py-3">Production architecture</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.capability}
                  className={i % 2 === 0 ? "bg-ink-900" : "bg-ink-850/40"}
                >
                  <td className="px-4 py-3 align-top font-medium text-slate-100">
                    {row.capability}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-400">{row.demo}</td>
                  <td className="px-4 py-3 align-top text-slate-300">{row.production}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-amber-200">What is real in the demo</h2>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-400">
              <li>Force-directed graph over 55 synthetic entities and 100+ relations.</li>
              <li>Betweenness, PageRank and Louvain community detection running in-browser.</li>
              <li>Rule-based suspicion flags, including cross-cluster brokers.</li>
              <li>A genuine SHA-256 hash chain with verify / tamper / rebuild controls.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-800 p-5">
            <h2 className="text-sm font-semibold text-amber-200">What is not real</h2>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-400">
              <li>No live NLP, no Neo4j, no GNN weights, no Fabric network.</li>
              <li>No real persons, phone numbers, locations, or case files.</li>
              <li>No authentication, retention policy, or legal intercept integration.</li>
              <li>Audit hashes live only in browser memory for the session.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
