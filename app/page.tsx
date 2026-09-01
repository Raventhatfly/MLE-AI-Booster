import Link from "next/link";

import { BrandMark } from "@/components/BrandMark";
import { MasteryBars } from "@/components/MasteryBars";
import { ModuleCard } from "@/components/ModuleCard";
import { ProgressRing } from "@/components/ProgressRing";
import { StatTile } from "@/components/StatTile";
import { VerdictPill } from "@/components/VerdictPill";
import { WeeklyBars } from "@/components/WeeklyBars";
import { getDashboardData } from "@/lib/data";

/**
 * This page reads the database, so static prerendering MUST stay off — otherwise
 * the build would connect to the DB, violating the "never touch the database at
 * build time" constraint and breaking both CI and the cloud build.
 * See the "local has a DB, cloud does not" section in the README.
 */
export const dynamic = "force-dynamic";

const IconBook = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 1 4 16V5.5Z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 0 20 16V5.5Z" />
  </svg>
);

const IconWrong = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3.5 21 19.5H3L12 3.5Z" />
    <path d="M12 9.5v4" />
    <path d="M12 16.5h.01" />
  </svg>
);

const IconClassifier = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </svg>
);

const NAV = [
  { href: "/", label: "Overview", active: true },
  { href: "/books", label: "Books", active: false },
  { href: "/wrong-answers", label: "Mistakes", active: false },
  { href: "/classifier", label: "Classifier", active: false },
];

export default async function Home() {
  const data = await getDashboardData();
  const {
    source,
    todayPlan,
    overview,
    books,
    wrongAnswers,
    categoryMastery,
    difficultyBreakdown,
    weeklyActivity,
    recentAttempts,
  } = data;

  const activeBook =
    books.find((b) => b.finished > 0 && b.finished < b.total) ?? books[0];
  const totalBookQuestions = books.reduce((s, b) => s + b.total, 0);
  const totalBookFinished = books.reduce((s, b) => s + b.finished, 0);
  const difficultyHint = difficultyBreakdown
    .map((d) => d.difficulty + " " + d.count)
    .join(" · ");
  const masteredPct =
    overview.totalQuestions > 0
      ? Math.round((overview.masteredQuestions / overview.totalQuestions) * 100)
      : 0;

  return (
    <div className="flex min-h-full flex-col bg-plane">
      {/* ---------- Top bar ---------- */}
      <header className="sticky top-0 z-20 border-b border-hairline bg-surface/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <BrandMark />

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={
                  item.active
                    ? "rounded-md bg-brand-blue/10 px-3 py-1.5 text-[13px] font-medium text-brand-blue"
                    : "rounded-md px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {overview.streakDays > 0 ? (
              <span className="hidden items-center gap-1.5 rounded-full border border-brand-garnet/30 bg-brand-garnet/10 px-2.5 py-1 text-[11px] font-medium text-brand-garnet sm:inline-flex">
                <span aria-hidden="true">🔥</span>
                <span className="tnum">{overview.streakDays}-day streak</span>
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        {/* Cloud shape: no database, so do not fake personal progress */}
        {source === "seed" ? (
          <div className="mb-5 rounded-lg border border-brand-blue/25 bg-brand-blue/5 px-4 py-3 text-[12px] leading-relaxed text-ink-2">
            <span className="font-medium text-brand-blue">Read-only demo</span> — no
            database is configured in this environment, so the question bank is shown
            but all personal progress reads as zero. Run it locally for the full
            experience (<code className="font-mono">npm run dev</code>).
          </div>
        ) : null}

        {/* ---------- Today's goal + KPIs ---------- */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-5">
            <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand-blue via-brand-blue to-brand-garnet" />
            <div className="flex flex-wrap items-center gap-6">
              <ProgressRing
                finished={todayPlan.finished}
                target={todayPlan.target}
              />
              <div className="min-w-[180px] flex-1">
                <h1 className="text-[17px] font-semibold text-ink">Today&apos;s goal</h1>
                <p className="mt-1 text-xs text-ink-2">
                  {todayPlan.finished >= todayPlan.target
                    ? "Goal met for today — keep going if you want"
                    : `${todayPlan.target - todayPlan.finished} more to hit today's goal`}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-[11px] text-ink-muted">Streak</dt>
                    <dd className="tnum mt-0.5 text-[15px] font-semibold text-ink">
                      {todayPlan.streakDays} days
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-muted">Time today</dt>
                    <dd className="tnum mt-0.5 text-[15px] font-semibold text-ink">
                      {todayPlan.minutesSpent} min
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/books"
                    className="rounded-md bg-brand-blue px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-blue-deep"
                  >
                    {activeBook ? `Continue ${activeBook.name}` : "Pick a book"}
                  </Link>
                  <Link
                    href="/classifier"
                    className="rounded-md border border-hairline px-3 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    Random question
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatTile
              label="Questions in bank"
              value={String(overview.totalQuestions)}
              unit=""
              hint={difficultyHint}
              accent="blue"
            />
            <StatTile
              label="Mastered"
              value={String(overview.masteredQuestions)}
              unit=""
              hint={"latest attempt graded correct · " + masteredPct + "% of bank"}
              accent="blue"
            />
            <StatTile
              label="Accuracy (30d)"
              value={
                overview.accuracy30d === null
                  ? "—"
                  : Math.round(overview.accuracy30d * 100) + "%"
              }
              hint={
                overview.accuracy30d === null
                  ? "no attempts yet"
                  : "share graded Correct by the AI"
              }
              accent="garnet"
            />
            <StatTile
              label="To review"
              value={String(wrongAnswers.total)}
              unit=""
              hint={
                wrongAnswers.total === 0
                  ? "nothing to review"
                  : `${wrongAnswers.wrongCount} incorrect · ${wrongAnswers.partialCount} partial`
              }
              accent="garnet"
            />
          </div>
        </section>

        {/* ---------- The three primary entries ---------- */}
        <section className="mt-6">
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-ink-muted">
            Modules
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ModuleCard
              href="/books"
              title="Question Books"
              subtitle="Themed collections, each tracking its own progress"
              icon={IconBook}
              metricValue={String(totalBookFinished)}
              metricLabel={"of " + totalBookQuestions + " attempted"}
              accent="blue"
              footer={
                <div className="flex flex-col gap-2">
                  {books.slice(0, 3).map((b) => {
                    const pct =
                      b.total > 0 ? Math.round((b.finished / b.total) * 100) : 0;
                    return (
                      <div key={b.id}>
                        <div className="flex items-baseline justify-between gap-2 text-[11px]">
                          <span className="truncate text-ink-2">{b.name}</span>
                          <span className="tnum shrink-0 text-ink-muted">
                            {pct}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-track">
                          <div
                            className="h-full rounded-full bg-mark-blue"
                            style={{ width: Math.max(pct, 1.5) + "%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            />

            <ModuleCard
              href="/wrong-answers"
              title="Mistake Bank"
              subtitle="Questions whose latest attempt was incorrect or partial"
              icon={IconWrong}
              metricValue={String(wrongAnswers.total)}
              metricLabel="to review"
              accent="garnet"
              footer={
                wrongAnswers.byCategory.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {wrongAnswers.byCategory.slice(0, 4).map((c) => (
                      <li
                        key={c.category}
                        className="flex items-baseline justify-between gap-2 text-[11px]"
                      >
                        <span className="truncate text-ink-2">{c.category}</span>
                        <span className="tnum shrink-0 font-medium text-brand-garnet">
                          {c.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-ink-muted">No mistakes recorded yet</p>
                )
              }
            />

            <ModuleCard
              href="/classifier"
              title="Question Classifier"
              subtitle="Filter by knowledge area and difficulty to target weak spots"
              icon={IconClassifier}
              metricValue={String(categoryMastery.length)}
              metricLabel={"areas · " + difficultyBreakdown.length + " difficulty tiers"}
              accent="crimson"
              footer={
                <div className="flex flex-wrap gap-1.5">
                  {categoryMastery.map((c) => (
                    <span
                      key={c.category}
                      className="rounded-md border border-hairline bg-surface-2 px-1.5 py-0.5 text-[11px] text-ink-2"
                    >
                      {c.category}
                    </span>
                  ))}
                </div>
              }
            />
          </div>
        </section>

        {/* ---------- Mastery + last 7 days ---------- */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink">Mastery by area</h2>
              <Link
                href="/classifier"
                className="text-[12px] text-brand-blue hover:underline"
              >
                Classifier →
              </Link>
            </div>
            <MasteryBars data={categoryMastery} />
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <h2 className="mb-1 text-[15px] font-semibold text-ink">Activity</h2>
            <WeeklyBars data={weeklyActivity} />
          </div>
        </section>

        {/* ---------- Recent attempts ---------- */}
        <section className="mt-6">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink">Recent attempts</h2>
              <span className="text-[12px] text-ink-muted">AI grading</span>
            </div>
            {recentAttempts.length > 0 ? (
              <ul className="divide-y divide-hairline">
                {recentAttempts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] text-ink">
                        {a.questionTitle}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-muted">
                        <span>{a.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tnum">{a.answeredAt.slice(0, 10)}</span>
                      </div>
                    </div>
                    <VerdictPill verdict={a.verdict} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-[12px] text-ink-muted">
                No attempts yet. Pick a question from a book to get started.
              </p>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Data source:{" "}
          {source === "db" ? "local SQLite database" : "read-only seed data (no database configured)"}
        </p>
      </main>
    </div>
  );
}
