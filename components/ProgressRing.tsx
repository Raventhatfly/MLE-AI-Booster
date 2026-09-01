/**
 * A single ratio against a limit — rendered as a meter (same-ramp track plus
 * fill), never a two-slice pie. The number itself is the hero figure at >=48px.
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
        aria-label={`${finished} of ${target} questions answered today, ${pct}% complete`}
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
        <div className="tnum mt-1 text-xs text-ink-muted">/ {target}</div>
      </div>
    </div>
  );
}
