import Link from "next/link";

import { BrandMark } from "./BrandMark";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/books", label: "Books" },
  { href: "/wrong-answers", label: "Mistakes" },
  { href: "/classifier", label: "Classifier" },
];

/** Shared top bar. `current` marks the active nav item by href. */
export function SiteHeader({
  current,
  streakDays,
}: {
  current?: string;
  streakDays?: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-surface/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="shrink-0">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => {
            const active = item.href === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-md bg-brand-blue/10 px-3 py-1.5 text-[13px] font-medium text-brand-blue"
                    : "rounded-md px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {streakDays && streakDays > 0 ? (
            <span className="hidden items-center gap-1.5 rounded-full border border-brand-garnet/30 bg-brand-garnet/10 px-2.5 py-1 text-[11px] font-medium text-brand-garnet sm:inline-flex">
              <span aria-hidden="true">🔥</span>
              <span className="tnum">{streakDays}-day streak</span>
            </span>
          ) : null}
          <Link
            href="/books"
            className="rounded-md bg-brand-blue px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-blue-deep"
          >
            Start practicing
          </Link>
        </div>
      </div>
    </header>
  );
}
