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
 * 本页读数据库，因此必须禁用静态预渲染 —— 否则构建期就会去连库，
 * 违反「构建期绝不连数据库」的约束，云端和 CI 都会构建失败。
 * 见 README「运行形态：本地带数据库，云端不带」。
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
  { href: "/", label: "总览", active: true },
  { href: "/books", label: "题本", active: false },
  { href: "/wrong-answers", label: "错题库", active: false },
  { href: "/classifier", label: "分类器", active: false },
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
            {overview.streakDays > 0 ? (
              <span className="hidden items-center gap-1.5 rounded-full border border-brand-garnet/30 bg-brand-garnet/10 px-2.5 py-1 text-[11px] font-medium text-brand-garnet sm:inline-flex">
                <span aria-hidden="true">🔥</span>
                <span className="tnum">连续 {overview.streakDays} 天</span>
              </span>
            ) : null}
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
        {/* 云端形态：没有数据库，不谎报个人进度 */}
        {source === "seed" ? (
          <div className="mb-5 rounded-lg border border-brand-blue/25 bg-brand-blue/5 px-4 py-3 text-[12px] leading-relaxed text-ink-2">
            <span className="font-medium text-brand-blue">只读演示模式</span>
            ：当前环境未配置数据库，仅展示题库内容，
            所有个人学习进度显示为 0。完整功能请在本地运行（
            <code className="font-mono">npm run dev</code>）。
          </div>
        ) : null}

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
                  {todayPlan.finished >= todayPlan.target
                    ? "今日目标已完成，可以继续加练"
                    : `还差 ${todayPlan.target - todayPlan.finished} 题完成今日目标`}
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
                    {activeBook ? `继续《${activeBook.name}》` : "选择题本"}
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
              hint={"最近一次判定为正确 · 占 " + masteredPct + "%"}
              accent="blue"
            />
            <StatTile
              label="近 30 天正确率"
              value={
                overview.accuracy30d === null
                  ? "—"
                  : Math.round(overview.accuracy30d * 100) + "%"
              }
              hint={
                overview.accuracy30d === null
                  ? "暂无作答记录"
                  : "AI 批改判定为「正确」的比例"
              }
              accent="garnet"
            />
            <StatTile
              label="待复习错题"
              value={String(wrongAnswers.total)}
              unit="题"
              hint={
                wrongAnswers.total === 0
                  ? "暂无错题"
                  : `错误 ${wrongAnswers.wrongCount} · 部分正确 ${wrongAnswers.partialCount}`
              }
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
              metricLabel={"/ " + totalBookQuestions + " 题已作答"}
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
              title="错题库"
              subtitle="最近一次判定为错误或部分正确的题目，集中复习"
              icon={IconWrong}
              metricValue={String(wrongAnswers.total)}
              metricLabel="题待复习"
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
                  <p className="text-[11px] text-ink-muted">暂无错题记录</p>
                )
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
                还没有作答记录。从题本里挑一道题开始吧。
              </p>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          数据来源：
          {source === "db" ? "本地 SQLite 数据库" : "只读种子数据（未配置数据库）"}
        </p>
      </main>
    </div>
  );
}
