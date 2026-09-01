import type { Verdict } from "@/lib/types";

/**
 * Status colors are fixed functional colors and deliberately do NOT follow the
 * red/blue brand palette. They always ship as icon + label so meaning is never
 * carried by color alone (warning falls below 3:1 on the light surface, so the
 * label is what makes it readable).
 */
const MAP: Record<Verdict, { label: string; icon: string; className: string }> = {
  correct: {
    label: "Correct",
    icon: "✓",
    className: "text-good border-good/30 bg-good/10",
  },
  partial: {
    label: "Partial",
    icon: "!",
    className: "text-ink-2 border-warning/50 bg-warning/15",
  },
  wrong: {
    label: "Incorrect",
    icon: "✕",
    className: "text-critical border-critical/30 bg-critical/10",
  },
};

export function VerdictPill({ verdict }: { verdict: Verdict }) {
  const v = MAP[verdict];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${v.className}`}
    >
      <span aria-hidden="true">{v.icon}</span>
      {v.label}
    </span>
  );
}
