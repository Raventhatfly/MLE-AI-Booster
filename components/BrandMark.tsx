/** Blaugrana vertical stripes: alternating Barca blue and garnet. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="flex h-7 gap-[2px] overflow-hidden rounded-[3px]"
        aria-hidden="true"
      >
        <span className="w-[3px] bg-brand-blue" />
        <span className="w-[3px] bg-brand-garnet" />
        <span className="w-[3px] bg-brand-blue" />
        <span className="w-[3px] bg-brand-garnet" />
        <span className="w-[3px] bg-brand-blue" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight text-ink">
          MLE AI Booster
        </div>
        <div className="text-[11px] text-ink-muted">Interview drills, AI-graded</div>
      </div>
    </div>
  );
}
