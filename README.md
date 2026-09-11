# GraphSentry

AI-powered criminal network analysis dashboard — a **Smart India Hackathon prototype**.

All names, phones, locations and organisations are **synthetic fiction**. This is not a real investigation and must never be populated with real personal or surveillance data.

## Run

```bash
npm install
npm run generate-seed   # regenerates src/data/network.json
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo path for judges (≈2 minutes)

1. **Briefing** (`/`) — problem, tagline, four-step pipeline.
2. **Live graph** (`/dashboard`) — click **Karan Sethi** in Top influencers. Toggle **Community clusters**.
3. **Audit trail** (`/audit`) — Verify integrity (green). Simulate tamper (red). Rebuild chain.
4. **Architecture** (`/about`) — demo substitutes vs production (NLP, Neo4j, GNN, Hyperledger Fabric).

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · react-force-graph-2d · graphology · Zustand · Web Crypto SHA-256
