/** KPI 小卡：单个当前值。不要用只有一根柱子的柱状图代替。 */
export function StatTile({
  label,
  value,
  unit,
  hint,
  accent = "blue",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: "blue" | "garnet" | "neutral";
}) {
  const accentBar =
    accent === "blue"
      ? "bg-brand-blue"
      : accent === "garnet"
        ? "bg-brand-garnet"
        : "bg-hairline";

  return (
    <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-4">
      <span className={`absolute inset-y-0 left-0 w-[3px] ${accentBar}`} />
      <div className="text-xs text-ink-2">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="tnum text-[28px] font-semibold leading-none text-ink">
          {value}
        </span>
        {unit ? <span className="text-xs text-ink-muted">{unit}</span> : null}
      </div>
      {hint ? <div className="mt-1.5 text-[11px] text-ink-muted">{hint}</div> : null}
    </div>
  );
}
