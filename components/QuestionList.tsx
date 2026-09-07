import Link from "next/link";

import type { QuestionSummary } from "@/lib/questions";

import { VerdictPill } from "./VerdictPill";

/** Difficulty is ordinal, so it gets one hue at three steps, not three colors. */
const DIFFICULTY_CLASS: Record<string, string> = {
  Easy: "border-mark-blue/25 bg-mark-blue/5 text-ink-2",
  Medium: "border-mark-blue/45 bg-mark-blue/10 text-ink-2",
  Hard: "border-mark-blue/70 bg-mark-blue/20 text-ink",
};

export function DifficultyTag({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${
        DIFFICULTY_CLASS[difficulty] ?? "border-hairline bg-surface-2 text-ink-2"
      }`}
    >
      {difficulty}
    </span>
  );
}

export function QuestionList({
  questions,
  emptyMessage = "No questions match this filter.",
  showCategory = true,
}: {
  questions: QuestionSummary[];
  emptyMessage?: string;
  showCategory?: boolean;
}) {
  if (questions.length === 0) {
    return (
      <p className="rounded-xl border border-hairline bg-surface px-5 py-10 text-center text-[13px] text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
      {questions.map((q) => (
        <li key={q.id}>
          <Link
            href={`/questions/${q.id}`}
            className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue"
          >
            <div className="min-w-0">
              <div className="text-[13px] leading-snug text-ink">{q.title}</div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                {showCategory ? <span>{q.category}</span> : null}
                {showCategory ? <span aria-hidden="true">·</span> : null}
                <DifficultyTag difficulty={q.difficulty} />
                {q.attemptCount > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tnum">
                      {q.attemptCount} attempt{q.attemptCount === 1 ? "" : "s"}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 pt-0.5">
              {q.latestVerdict ? (
                <VerdictPill verdict={q.latestVerdict} />
              ) : (
                <span className="text-[11px] text-ink-muted">Not attempted</span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
