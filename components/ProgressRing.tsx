/**
 * 单一比值对上限 —— 用 meter 形式（同色系轨道 + 填充），不用饼图。
 * 数字本身是英雄数字，尺寸 >= 48px。
 */
export function ProgressRing({
  finished,
  target,
  size = 148,
}: {
  finished: number;
  target: number;
  size?: number;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = target > 0 ? Math.min(finished / target, 1) : 0;
  const pct = Math.round(ratio * 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`今日已完成 ${finished} 题，目标 ${target} 题，完成度 ${pct}%`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--mark-blue)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * ratio} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="tnum text-[44px] font-semibold leading-none text-ink">
          {finished}
        </div>
        <div className="tnum mt-1 text-xs text-ink-muted">/ {target} 题</div>
      </div>
    </div>
  );
}
