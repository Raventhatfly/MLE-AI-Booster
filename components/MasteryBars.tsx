import type { CategoryMastery } from "@/lib/types";

/**
 * 每个分类是「已掌握 / 总题数」这一个比值对上限 —— 用 meter（同色系轨道 + 填充），
 * 不用饼图、不用多色柱。所有分类量的是同一个指标，因此单一色相（顺序色），
 * 不使用分类色板。
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
              aria-label={`${row.category}：已掌握 ${row.mastered} 题，共 ${row.total} 题，${pct}%`}
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
