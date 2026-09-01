import Link from "next/link";

import { BrandMark } from "@/components/BrandMark";
import { MasteryBars } from "@/components/MasteryBars";
import { ModuleCard } from "@/components/ModuleCard";
import { ProgressRing } from "@/components/ProgressRing";
import { StatTile } from "@/components/StatTile";
import { VerdictPill } from "@/components/VerdictPill";
import { WeeklyBars } from "@/components/WeeklyBars";
import {
  categoryMastery,
  difficultyBreakdown,
  overview,
  questionBooks,
  recentAttempts,
  todayPlan,
  weeklyActivity,
  wrongAnswerBank,
} from "@/lib/mock-data";

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
  { href: "/", label: "总览", active: true },
  { href: "/books", label: "题本", active: false },
  { href: "/wrong-answers", label: "错题库", active: false },
  { href: "/classifier", label: "分类器", active: false },
];

export default function Home() {
  const activeBook = questionBooks.find((b) => b.active) ?? questionBooks[0];
  const totalBookQuestions = questionBooks.reduce((s, b) => s + b.total, 0);
  const totalBookFinished = questionBooks.reduce((s, b) => s + b.finished, 0);
  const difficultyHint = difficultyBreakdown
    .map((d) => d.difficulty + " " + d.count)
    .join(" · ");
  const masteredPct = Math.round(
    (overview.masteredQuestions / overview.totalQuestions) * 100,
  );

  return (
    <div className="flex min-h-full flex-col bg-plane">
      {/* ---------- 顶栏 ---------- */}
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
            <span className="hidden items-center gap-1.5 rounded-full border border-brand-garnet/30 bg-brand-garnet/10 px-2.5 py-1 text-[11px] font-medium text-brand-garnet sm:inline-flex">
              <span aria-hidden="true">🔥</span>
              <span className="tnum">连续 {overview.streakDays} 天</span>
            </span>
            <Link
              href="/books"
              className="rounded-md bg-brand-blue px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-blue-deep"
            >
              开始刷题
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
        {/* ---------- 今日计划 + KPI ---------- */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-5">
            <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand-blue via-brand-blue to-brand-garnet" />
            <div className="flex flex-wrap items-center gap-6">
              <ProgressRing
                finished={todayPlan.finished}
                target={todayPlan.target}
              />
              <div className="min-w-[180px] flex-1">
                <h1 className="text-[17px] font-semibold text-ink">今日计划</h1>
                <p className="mt-1 text-xs text-ink-2">
                  还差 {Math.max(todayPlan.target - todayPlan.finished, 0)}{" "}
                  题完成今日目标
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="text-[11px] text-ink-muted">连续打卡</dt>
                    <dd className="tnum mt-0.5 text-[15px] font-semibold text-ink">
                      {todayPlan.streakDays} 天
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-ink-muted">今日用时</dt>
                    <dd className="tnum mt-0.5 text-[15px] font-semibold text-ink">
                      {todayPlan.minutesSpent} 分钟
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/books"
                    className="rounded-md bg-brand-blue px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-blue-deep"
                  >
                    继续《{activeBook.name}》
                  </Link>
                  <Link
                    href="/classifier"
                    className="rounded-md border border-hairline px-3 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    随机一题
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatTile
              label="题库总量"
              value={String(overview.totalQuestions)}
              unit="题"
              hint={difficultyHint}
              accent="blue"
            />
            <StatTile
              label="已掌握"
              value={String(overview.masteredQuestions)}
              unit="题"
              hint={"占题库 " + masteredPct + "%"}
              accent="blue"
            />
            <StatTile
              label="近 30 天正确率"
              value={Math.round(overview.accuracy30d * 100) + "%"}
              hint="AI 批改判定为「正确」的比例"
              accent="garnet"
            />
            <StatTile
              label="待复习错题"
              value={String(wrongAnswerBank.dueToday)}
              unit="题"
              hint={"错题库共 " + wrongAnswerBank.total + " 题"}
              accent="garnet"
            />
          </div>
        </section>

        {/* ---------- 三大入口 ---------- */}
        <section className="mt-6">
          <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-ink-muted">
            核心模块
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ModuleCard
              href="/books"
              title="MLE 题本"
              subtitle="按主题成册刷题，每本独立记录进度"
              icon={IconBook}
              metricValue={String(totalBookFinished)}
              metricLabel={"/ " + totalBookQuestions + " 题已完成"}
              accent="blue"
              footer={
                <div className="flex flex-col gap-2">
                  {questionBooks.slice(0, 3).map((b) => {
                    const pct = Math.round((b.finished / b.total) * 100);
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
              title="错题库"
              subtitle="AI 判定为错误或部分正确的题目，按到期时间安排复习"
              icon={IconWrong}
              metricValue={String(wrongAnswerBank.total)}
              metricLabel={"题 · 今日到期 " + wrongAnswerBank.dueToday}
              accent="garnet"
              footer={
                <ul className="flex flex-col gap-1.5">
                  {wrongAnswerBank.byCategory.slice(0, 4).map((c) => (
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
              }
            />

            <ModuleCard
              href="/classifier"
              title="MLE 题库分类器"
              subtitle="按知识分类 × 难度筛选题目，定位薄弱环节"
              icon={IconClassifier}
              metricValue={String(categoryMastery.length)}
              metricLabel={"个分类 · " + difficultyBreakdown.length + " 档难度"}
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

        {/* ---------- 掌握度 + 近 7 天 ---------- */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink">分类掌握度</h2>
              <Link
                href="/classifier"
                className="text-[12px] text-brand-blue hover:underline"
              >
                去分类器 →
              </Link>
            </div>
            <MasteryBars data={categoryMastery} />
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <h2 className="mb-1 text-[15px] font-semibold text-ink">刷题趋势</h2>
            <WeeklyBars data={weeklyActivity} />
          </div>
        </section>

        {/* ---------- 最近作答 ---------- */}
        <section className="mt-6">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-ink">最近作答</h2>
              <span className="text-[12px] text-ink-muted">AI 批改结果</span>
            </div>
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
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          当前为本地假数据（
          <code className="font-mono">lib/mock-data.ts</code>
          ），阶段 1 接入 Prisma 与 Claude API 后替换。
        </p>
      </main>
    </div>
  );
}
