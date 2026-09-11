export const TYPE_COLORS: Record<string, string> = {
  person: "#22d3ee",
  phone: "#a78bfa",
  vehicle: "#fb7185",
  location: "#34d399",
  organization: "#fbbf24",
};

export const TYPE_LABELS: Record<string, string> = {
  person: "Person",
  phone: "Phone",
  vehicle: "Vehicle",
  location: "Location",
  organization: "Organization",
};

export const RELATION_COLORS: Record<string, string> = {
  call: "#64748b",
  transaction: "#d97706",
  "co-location": "#059669",
  family: "#e11d48",
  witness: "#38bdf8",
  surveillance: "#94a3b8",
  social: "#e879f9",
};

export const EVIDENCE_LABELS: Record<string, string> = {
  call: "Call record",
  transaction: "Financial transaction",
  witness: "Witness statement",
  surveillance: "Surveillance note",
  "co-location": "Co-location",
  social: "Social media",
  family: "Family / associate",
};

export const EVIDENCE_OPTIONS = [
  "call",
  "transaction",
  "witness",
  "surveillance",
  "co-location",
  "social",
] as const;

export const CONFIDENCE_STYLES: Record<string, string> = {
  high: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  medium: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  low: "border-slate-600 bg-slate-800/80 text-slate-400",
};

export const COMMUNITY_COLORS = [
  "#22d3ee",
  "#fbbf24",
  "#a78bfa",
  "#34d399",
  "#fb7185",
  "#60a5fa",
  "#f97316",
  "#c084fc",
];

export const SEVERITY_STYLES: Record<string, string> = {
  watch: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  high: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  critical: "border-rose-400/50 bg-rose-400/10 text-rose-200",
};
