export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`border-y border-amber-500/20 bg-amber-400/5 font-mono text-amber-100/90 ${
        compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-xs"
      }`}
    >
      CASE STUDY DATA — NOT REAL PERSONS. Names, phones, locations and events are
      fictional training data for a Smart India Hackathon prototype. No real
      investigation, surveillance, or personal data is used.
    </div>
  );
}
