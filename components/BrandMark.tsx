/** blaugrana 竖条纹品牌标记：巴萨蓝 / 石榴红交替 */
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
        <div className="text-[11px] text-ink-muted">面试刷题 · AI 陪练</div>
      </div>
    </div>
  );
}
