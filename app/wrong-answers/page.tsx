import type { Metadata } from "next";
import Link from "next/link";

import { QuestionList } from "@/components/QuestionList";
import { SiteHeader } from "@/components/SiteHeader";
import { listMistakes } from "@/lib/questions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mistake Bank · MLE AI Booster",
};

export default async function MistakesPage() {
  const mistakes = await listMistakes();
  const wrong = mistakes.filter((q) => q.latestVerdict === "wrong");
  const partial = mistakes.filter((q) => q.latestVerdict === "partial");

  return (
    <div className="flex min-h-full flex-col bg-plane">
      <SiteHeader current="/wrong-answers" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-6">
        <div className="mb-5">
          <h1 className="text-[20px] font-semibold text-ink">Mistake Bank</h1>
          <p className="mt-1 text-[13px] text-ink-2">
            Questions whose most recent attempt was graded incorrect or partially
            correct. A question leaves this list once you get it right.
          </p>
        </div>

        {mistakes.length > 0 ? (
          <>
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="rounded-lg border border-critical/30 bg-critical/5 px-4 py-2.5">
                <div className="tnum text-[20px] font-semibold leading-none text-ink">
                  {wrong.length}
                </div>
                <div className="mt-1 text-[11px] text-ink-2">Incorrect</div>
              </div>
              <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5">
                <div className="tnum text-[20px] font-semibold leading-none text-ink">
                  {partial.length}
                </div>
                <div className="mt-1 text-[11px] text-ink-2">Partially correct</div>
              </div>
            </div>

            {wrong.length > 0 ? (
              <section className="mb-5">
                <h2 className="mb-2 text-[13px] font-semibold text-ink">
                  Incorrect — review these first
                </h2>
                <QuestionList questions={wrong} />
              </section>
            ) : null}

            {partial.length > 0 ? (
              <section>
                <h2 className="mb-2 text-[13px] font-semibold text-ink">
                  Partially correct
                </h2>
                <QuestionList questions={partial} />
              </section>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl border border-hairline bg-surface px-5 py-12 text-center">
            <p className="text-[13px] text-ink">Nothing to review.</p>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              Questions you get wrong will collect here automatically.
            </p>
            <Link
              href="/books"
              className="mt-4 inline-block rounded-md bg-brand-blue px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-blue-deep"
            >
              Go practice
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
