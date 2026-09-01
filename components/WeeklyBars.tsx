import type { DailyActivity } from "@/lib/types";

/**
 * Single-series trend over time — one hue, column chart.
 * 2px surface gap between adjacent bars; 4px rounded data-ends anchored to the
 * baseline; only the peak day is direct-labeled (not a number on every bar);
 * hairline baseline, recessive. Each bar carries a CSS-only hover tooltip, so
 * this stays a server component.
 */
export function WeeklyBars({ data }: { data: DailyActivity[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="tnum text-[22px] font-semibold leading-none text-ink">
          {total}
        </span>
        <span className="text-xs text-ink-muted">answered in the last 7 days</span>
      </div>

      <div className="flex h-28 items-end gap-[2px]">
        {data.map((d) => {
          const isPeak = d.label === peak.label;
          return (
            <div
              key={d.date}
              className="group relative flex flex-1 flex-col items-center justify-end gap-1"
            >
              {isPeak ? (
                <span className="tnum text-[10px] font-medium text-ink-2">
                  {d.count}
                </span>
              ) : null}

              <div
                className="w-full rounded-t-[4px] bg-mark-blue/85 transition-colors group-hover:bg-mark-blue"
                style={{ height: `${Math.max((d.count / max) * 88, 3)}%` }}
              />

              {/* hover tooltip：命中区域比柱本身大 */}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-hairline bg-surface px-2 py-1 text-[11px] text-ink shadow-sm group-hover:block">
                <span className="tnum">{d.date}</span>
                <span className="mx-1 text-ink-muted">·</span>
                <span className="tnum font-medium">{d.count}</span>
              </span>

              <span className="absolute inset-0 -top-2" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      {/* 基线 */}
      <div className="mt-0 h-px bg-hairline" />

      <div className="mt-1.5 flex gap-[2px]">
        {data.map((d) => (
          <span
            key={d.date}
            className="tnum flex-1 text-center text-[10px] text-ink-muted"
          >
            {d.label.slice(3)}
          </span>
        ))}
      </div>
    </div>
  );
}
