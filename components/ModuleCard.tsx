import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Module card for the three primary dashboard entries. The module split follows
 * the Baicizhan pattern (wordbook / mistake book / browse): one large entry per
 * module showing a single status number, with the detailed list one level in.
 */
export function ModuleCard({
  href,
  title,
  subtitle,
  icon,
  metricValue,
  metricLabel,
  accent,
  footer,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  metricValue: string;
  metricLabel: string;
  accent: "blue" | "garnet" | "crimson";
  footer?: ReactNode;
}) {
  const topBar =
    accent === "blue"
      ? "bg-brand-blue"
      : accent === "garnet"
        ? "bg-brand-garnet"
        : "bg-brand-crimson";
  const iconWrap =
    accent === "blue"
      ? "bg-brand-blue/10 text-brand-blue"
      : accent === "garnet"
        ? "bg-brand-garnet/10 text-brand-garnet"
        : "bg-brand-crimson/10 text-brand-crimson";

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface p-5 transition-shadow hover:shadow-[0_2px_16px_rgba(11,18,32,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
    >
      <span className={`absolute inset-x-0 top-0 h-[3px] ${topBar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-10 items-center justify-center rounded-lg ${iconWrap}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="tnum text-[26px] font-semibold leading-none text-ink">
            {metricValue}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted">{metricLabel}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          {title}
          <span
            aria-hidden="true"
            className="text-ink-muted transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </div>
        <div className="mt-1 text-xs leading-relaxed text-ink-2">{subtitle}</div>
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </Link>
  );
}
