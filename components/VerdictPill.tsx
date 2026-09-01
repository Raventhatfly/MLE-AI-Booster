import type { Verdict } from "@/lib/types";

/**
 * 状态色是固定的功能色，不跟品牌红蓝走；且始终「图标 + 文字」成对出现，
 * 不靠颜色单独表意（浅色表面上 warning 对比度低于 3:1，靠文字兜底）。
 */
const MAP: Record<Verdict, { label: string; icon: string; className: string }> = {
  correct: {
    label: "正确",
    icon: "✓",
    className: "text-good border-good/30 bg-good/10",
  },
  partial: {
    label: "部分正确",
    icon: "!",
    className: "text-ink-2 border-warning/50 bg-warning/15",
  },
  wrong: {
    label: "错误",
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
