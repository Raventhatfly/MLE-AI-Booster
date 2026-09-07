import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { getBooks } from "@/lib/questions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Question Books · MLE AI Booster",
};

export default async function BooksPage() {
  const books = await getBooks();
  const totalQuestions = books.reduce((s, b) => s + b.total, 0);
  const totalAttempted = books.reduce((s, b) => s + b.attempted, 0);

  return (
    <div className="flex min-h-full flex-col bg-plane">
      <SiteHeader current="/books" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        <div className="mb-5">
          <h1 className="text-[20px] font-semibold text-ink">Question Books</h1>
          <p className="mt-1 text-[13px] text-ink-2">
            {books.length} books · {totalQuestions} questions ·{" "}
            <span className="tnum">{totalAttempted}</span> attempted
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {books.map((b) => {
            const pct = b.total > 0 ? Math.round((b.attempted / b.total) * 100) : 0;
            const masteredPct =
              b.total > 0 ? Math.round((b.mastered / b.total) * 100) : 0;
            return (
              <Link
                key={b.id}
                href={`/books/${b.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface p-5 transition-shadow hover:shadow-[0_2px_16px_rgba(11,18,32,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                <span className="absolute inset-x-0 top-0 h-[3px] bg-brand-blue" />

                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                    {b.name}
                    <span
                      aria-hidden="true"
                      className="text-ink-muted transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </h2>
                  <span className="tnum shrink-0 text-[13px] font-semibold text-ink">
                    {b.total}
                  </span>
                </div>

                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-2">
                  {b.description}
                </p>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="text-ink-2">Attempted</span>
                    <span className="tnum text-ink-muted">
                      {b.attempted} / {b.total} · {pct}%
                    </span>
                  </div>
                  <div
                    className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-track"
                    role="img"
                    aria-label={`${b.name}: ${b.attempted} of ${b.total} attempted, ${b.mastered} mastered`}
                  >
                    {/* Two nested meters on one track: attempted, with mastered inside it */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-mark-blue/35"
                      style={{ width: `${Math.max(pct, 0)}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-mark-blue"
                      style={{ width: `${Math.max(masteredPct, 0)}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-ink-muted">
                    <span className="tnum font-medium text-ink">{b.mastered}</span>{" "}
                    mastered
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
