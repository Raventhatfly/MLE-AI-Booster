import type { CategoryMastery } from "@/lib/types";

/**
 * Each row is one ratio against a limit (mastered / total), so it is a meter:
 * same-ramp track plus fill. Every row measures the SAME quantity, so this uses
 * a single hue (sequential), never the categorical palette.
 */
export function MasteryBars({ data }: { data: CategoryMastery[] }) {
  const sorted = [...data].sort(
    (a, b) => b.mastered / b.total - a.mastered / a.total,
  );

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((row) => {
        const ratio = row.mastered / row.total;
        const pct = Math.round(ratio * 100);
        return (
          <li key={row.category} className="group">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-ink-2">{row.category}</span>
              <span className="tnum shrink-0 text-ink-muted">
                <span className="font-medium text-ink">{row.mastered}</span>
                {" / "}
                {row.total}
                <span className="ml-1.5 text-ink-muted">{pct}%</span>
              </span>
            </div>
            <div
              className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-track"
              role="img"
              aria-label={`${row.category}: ${row.mastered} of ${row.total} mastered, ${pct}%`}
            >
              <div
                className="h-full rounded-full bg-mark-blue transition-[width]"
                style={{ width: `${Math.max(ratio * 100, 1.5)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
