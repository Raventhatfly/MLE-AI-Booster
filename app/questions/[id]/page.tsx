import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DifficultyTag } from "@/components/QuestionList";
import { SiteHeader } from "@/components/SiteHeader";
import { VerdictPill } from "@/components/VerdictPill";
import { getQuestion } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const q = await getQuestion(id);
  return { title: q ? `${q.title.slice(0, 60)} · MLE AI Booster` : "Question" };
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const q = await getQuestion(id);
  if (!q) notFound();

  return (
    <div className="flex min-h-full flex-col bg-plane">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6">
        <Link
          href={q.bookId ? `/books/${q.bookId}` : "/classifier"}
          className="text-[12px] text-ink-muted transition-colors hover:text-ink"
        >
          ← {q.bookName ?? "Back to classifier"}
        </Link>

        {/* ---------- Question ---------- */}
        <article className="mt-3 overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="border-b border-hairline px-5 py-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
              <span>{q.category}</span>
              <span aria-hidden="true">·</span>
              <DifficultyTag difficulty={q.difficulty} />
              {q.latestVerdict ? (
                <>
                  <span aria-hidden="true">·</span>
                  <VerdictPill verdict={q.latestVerdict} />
                </>
              ) : null}
            </div>
            <h1 className="text-[17px] font-semibold leading-snug text-ink">
              {q.title}
            </h1>
          </div>

          <div className="px-5 py-4">
            <p className="text-[14px] leading-relaxed text-ink-2">{q.content}</p>
          </div>
        </article>

        {/* ---------- Reference answer, hidden until asked for ---------- *
            A native <details> keeps this a server component - no client JS
            needed just to toggle a disclosure. */}
        <details className="group mt-4 overflow-hidden rounded-xl border border-hairline bg-surface">
          <summary className="cursor-pointer list-none px-5 py-3.5 text-[13px] font-medium text-brand-blue transition-colors hover:bg-surface-2">
            <span className="group-open:hidden">
              Show reference answer — try answering first
            </span>
            <span className="hidden group-open:inline">Hide reference answer</span>
          </summary>
          <div className="border-t border-hairline px-5 py-4">
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-2">
              {q.referenceAnswer}
            </p>
          </div>
        </details>

        {/* ---------- Past attempts ---------- */}
        {q.attempts.length > 0 ? (
          <section className="mt-4">
            <h2 className="mb-2 text-[13px] font-semibold text-ink">
              Your attempts{" "}
              <span className="tnum font-normal text-ink-muted">
                ({q.attempts.length})
              </span>
            </h2>
            <ul className="flex flex-col gap-3">
              {q.attempts.map((a) => (
                <li
                  key={a.id}
                  className="overflow-hidden rounded-xl border border-hairline bg-surface"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
                    <span className="tnum text-[11px] text-ink-muted">
                      {a.createdAt.slice(0, 10)}
                    </span>
                    {a.verdict ? <VerdictPill verdict={a.verdict} /> : null}
                  </div>
                  <div className="px-4 py-3">
                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">
                      {a.userAnswer}
                    </p>
                    {a.feedback ? (
                      <p className="mt-3 border-l-2 border-brand-blue/40 pl-3 text-[12px] leading-relaxed text-ink-2">
                        {a.feedback}
                      </p>
                    ) : null}
                    {a.followUps.length > 0 ? (
                      <div className="mt-3">
                        <div className="mb-1 text-[11px] font-medium text-ink-muted">
                          Follow-ups
                        </div>
                        <ul className="flex flex-col gap-1">
                          {a.followUps.map((f, i) => (
                            <li key={i} className="text-[12px] text-ink-2">
                              · {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="mt-4 rounded-xl border border-hairline bg-surface px-5 py-6 text-center text-[12px] text-ink-muted">
            You have not attempted this question yet.
          </p>
        )}

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Source: {q.source}
        </p>
      </main>
    </div>
  );
}
