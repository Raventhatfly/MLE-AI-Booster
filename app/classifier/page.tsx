import type { Metadata } from "next";
import Link from "next/link";

import { QuestionList } from "@/components/QuestionList";
import { SiteHeader } from "@/components/SiteHeader";
import { listQuestions } from "@/lib/questions";
import { CATEGORIES, DIFFICULTIES } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Question Classifier · MLE AI Booster",
};

const STATUSES = [
  { value: "unattempted", label: "Not attempted" },
  { value: "correct", label: "Correct" },
  { value: "partial", label: "Partial" },
  { value: "wrong", label: "Incorrect" },
] as const;

type Search = { category?: string; difficulty?: string; status?: string };

/** Build a href that toggles one filter while preserving the others. */
function toggleHref(current: Search, key: keyof Search, value: string): string {
  const next: Search = { ...current };
  if (next[key] === value) delete next[key];
  else next[key] = value;
  const qs = new URLSearchParams(
    Object.entries(next).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString();
  return qs ? `/classifier?${qs}` : "/classifier";
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={
        active
          ? "rounded-md border border-brand-blue bg-brand-blue px-2.5 py-1 text-[12px] font-medium text-white"
          : "rounded-md border border-hairline bg-surface px-2.5 py-1 text-[12px] text-ink-2 transition-colors hover:border-brand-blue/40 hover:text-ink"
      }
    >
      {children}
    </Link>
  );
}

export default async function ClassifierPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const category = CATEGORIES.includes(sp.category as never) ? sp.category : undefined;
  const difficulty = DIFFICULTIES.includes(sp.difficulty as never)
    ? sp.difficulty
    : undefined;
  const status = STATUSES.some((s) => s.value === sp.status)
    ? (sp.status as (typeof STATUSES)[number]["value"])
    : undefined;

  const current: Search = { category, difficulty, status };
  const questions = await listQuestions({ category, difficulty, status });
  const all = await listQuestions();
  const activeCount = [category, difficulty, status].filter(Boolean).length;

  return (
    <div className="flex min-h-full flex-col bg-plane">
      <SiteHeader current="/classifier" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-6">
        <div className="mb-5">
          <h1 className="text-[20px] font-semibold text-ink">Question Classifier</h1>
          <p className="mt-1 text-[13px] text-ink-2">
            Filter the bank by knowledge area, difficulty, and your own result.
          </p>
        </div>

        {/* Filters live in one row above the list */}
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-ink-muted">Area</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <FilterChip
                  key={c}
                  href={toggleHref(current, "category", c)}
                  active={category === c}
                >
                  {c}
                  <span className="ml-1.5 tnum opacity-60">
                    {all.filter((q) => q.category === c).length}
                  </span>
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-medium text-ink-muted">
              Difficulty
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTIES.map((d) => (
                <FilterChip
                  key={d}
                  href={toggleHref(current, "difficulty", d)}
                  active={difficulty === d}
                >
                  {d}
                  <span className="ml-1.5 tnum opacity-60">
                    {all.filter((q) => q.difficulty === d).length}
                  </span>
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[11px] font-medium text-ink-muted">Status</div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <FilterChip
                  key={s.value}
                  href={toggleHref(current, "status", s.value)}
                  active={status === s.value}
                >
                  {s.label}
                  <span className="ml-1.5 tnum opacity-60">
                    {
                      all.filter((q) =>
                        s.value === "unattempted"
                          ? q.latestVerdict === null
                          : q.latestVerdict === s.value,
                      ).length
                    }
                  </span>
                </FilterChip>
              ))}
            </div>
          </div>

          {activeCount > 0 ? (
            <div className="flex items-center gap-3 border-t border-hairline pt-3">
              <span className="tnum text-[12px] text-ink-2">
                {questions.length} of {all.length} questions
              </span>
              <Link
                href="/classifier"
                className="text-[12px] text-brand-blue hover:underline"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="border-t border-hairline pt-3 text-[12px] text-ink-muted tnum">
              {all.length} questions
            </div>
          )}
        </div>

        <QuestionList questions={questions} />
      </main>
    </div>
  );
}
