import seedFile from "@/data/seed-questions.json";

import {
  isVerdict,
  type BookProgress,
  type CategoryMastery,
  type DailyActivity,
  type DashboardData,
  type DifficultyCount,
  type RecentAttempt,
  type Verdict,
  type WrongAnswerSummary,
} from "./types";

/**
 * dashboard 的数据入口 —— 「本地带库 / 云端不带库」的唯一分叉点。
 *
 *   有 DATABASE_URL  -> 查本地 SQLite，显示真实进度
 *   无 DATABASE_URL  -> 只读种子数据，个人进度相关的数字一律为 0
 *
 * 云端（Vercel）刻意不配 DATABASE_URL，所以走后一条路径：
 * 题库内容照常展示，但不谎报任何个人学习数据。
 *
 * 统计口径（这些定义决定了页面上的数字含义，改动请同步改 README）：
 *   - 已掌握：该题「最近一次」作答判定为 correct
 *   - 错题库：该题「最近一次」作答判定为 wrong 或 partial
 *   - 连续打卡：从今天往前，连续每天都有作答记录的天数
 *   - 近 30 天正确率：近 30 天全部作答中 correct 的占比
 */

/** 每日目标题数。后续接用户设置后从数据库读。 */
const DAILY_TARGET = 12;

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * 是否配置了数据库。刻意在本文件内联判断，不从 ./db 静态 import ——
 * 因为 ./db 会把 better-sqlite3（原生模块）拉进依赖图，
 * 而云端形态根本不需要它。
 */
function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!hasDatabase()) return buildSeedFallback();
  return buildFromDatabase();
}

/* ------------------------------------------------------------------ *
 * 无数据库：只读种子数据
 * ------------------------------------------------------------------ */

function buildSeedFallback(): DashboardData {
  const questions = seedFile.questions;

  const byCategory = new Map<string, number>();
  const byDifficulty = new Map<string, number>();
  for (const q of questions) {
    byCategory.set(q.category, (byCategory.get(q.category) ?? 0) + 1);
    byDifficulty.set(q.difficulty, (byDifficulty.get(q.difficulty) ?? 0) + 1);
  }

  const books: BookProgress[] = seedFile.books.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    total: questions.filter((q) => q.bookId === b.id).length,
    finished: 0,
  }));

  const categoryMastery: CategoryMastery[] = [...byCategory.entries()].map(
    ([category, total]) => ({ category, total, mastered: 0 }),
  );

  return {
    source: "seed",
    todayPlan: {
      target: DAILY_TARGET,
      finished: 0,
      streakDays: 0,
      minutesSpent: 0,
    },
    overview: {
      totalQuestions: questions.length,
      masteredQuestions: 0,
      accuracy30d: null,
      streakDays: 0,
    },
    books,
    wrongAnswers: { total: 0, wrongCount: 0, partialCount: 0, byCategory: [] },
    categoryMastery,
    difficultyBreakdown: [...byDifficulty.entries()].map(([difficulty, count]) => ({
      difficulty,
      count,
    })),
    weeklyActivity: buildEmptyWeek(),
    recentAttempts: [],
  };
}

function buildEmptyWeek(): DailyActivity[] {
  const out: DailyActivity[] = [];
  const today = startOfDay(new Date());
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    out.push({ label: key.slice(5), date: key, count: 0 });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 有数据库：查本地 SQLite
 * ------------------------------------------------------------------ */

async function buildFromDatabase(): Promise<DashboardData> {
  // 动态 import：只有确实要查库时才加载 Prisma 与 better-sqlite3，
  // 云端（无 DATABASE_URL）永远走不到这里，原生模块不会进 bundle。
  const { getPrisma } = await import("./db");
  const prisma = getPrisma();

  const [questions, books, attempts] = await Promise.all([
    prisma.question.findMany({
      select: { id: true, title: true, category: true, difficulty: true, bookId: true },
    }),
    prisma.questionBook.findMany({ orderBy: { sortOrder: "asc" } }),
    // 单人自用规模（题目和作答都在千级以内），一次取出在内存里聚合，
    // 比拼多条 groupBy + 子查询更直观。数据量上来后再改成 SQL 聚合。
    prisma.attempt.findMany({
      select: {
        id: true,
        questionId: true,
        aiVerdict: true,
        durationSec: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const questionById = new Map(questions.map((q) => [q.id, q]));

  // ---- 每题的最近一次判定（attempts 已按时间倒序，首次遇到即最新）----
  const latestVerdict = new Map<string, Verdict>();
  for (const a of attempts) {
    if (latestVerdict.has(a.questionId)) continue;
    if (isVerdict(a.aiVerdict)) latestVerdict.set(a.questionId, a.aiVerdict);
  }

  // ---- 分类掌握度 ----
  const catTotal = new Map<string, number>();
  const catMastered = new Map<string, number>();
  const difficultyCount = new Map<string, number>();
  for (const q of questions) {
    catTotal.set(q.category, (catTotal.get(q.category) ?? 0) + 1);
    difficultyCount.set(q.difficulty, (difficultyCount.get(q.difficulty) ?? 0) + 1);
    if (latestVerdict.get(q.id) === "correct") {
      catMastered.set(q.category, (catMastered.get(q.category) ?? 0) + 1);
    }
  }
  const categoryMastery: CategoryMastery[] = [...catTotal.entries()].map(
    ([category, total]) => ({
      category,
      total,
      mastered: catMastered.get(category) ?? 0,
    }),
  );

  // ---- 错题库 ----
  const wrongByCategory = new Map<string, number>();
  let wrongCount = 0;
  let partialCount = 0;
  for (const [questionId, verdict] of latestVerdict) {
    if (verdict === "correct") continue;
    const q = questionById.get(questionId);
    if (!q) continue;
    if (verdict === "wrong") wrongCount += 1;
    else partialCount += 1;
    wrongByCategory.set(q.category, (wrongByCategory.get(q.category) ?? 0) + 1);
  }
  const wrongAnswers: WrongAnswerSummary = {
    total: wrongCount + partialCount,
    wrongCount,
    partialCount,
    byCategory: [...wrongByCategory.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  };

  // ---- 题本进度 ----
  const answeredQuestionIds = new Set(attempts.map((a) => a.questionId));
  const bookProgress: BookProgress[] = books.map((b) => {
    const inBook = questions.filter((q) => q.bookId === b.id);
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      total: inBook.length,
      finished: inBook.filter((q) => answeredQuestionIds.has(q.id)).length,
    };
  });

  // ---- 按天聚合 ----
  const perDay = new Map<string, { count: number; seconds: number }>();
  for (const a of attempts) {
    const key = toDateKey(a.createdAt);
    const cur = perDay.get(key) ?? { count: 0, seconds: 0 };
    cur.count += 1;
    cur.seconds += a.durationSec ?? 0;
    perDay.set(key, cur);
  }

  const today = startOfDay(new Date());
  const todayKey = toDateKey(today);
  const todayStats = perDay.get(todayKey) ?? { count: 0, seconds: 0 };

  const weeklyActivity: DailyActivity[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    weeklyActivity.push({
      label: key.slice(5),
      date: key,
      count: perDay.get(key)?.count ?? 0,
    });
  }

  // ---- 连续打卡：从今天往前数连续有记录的天数 ----
  let streakDays = 0;
  const probe = new Date(today);
  // 今天还没答题不算断签，从昨天开始数
  if (!perDay.has(todayKey)) probe.setDate(probe.getDate() - 1);
  while (perDay.has(toDateKey(probe))) {
    streakDays += 1;
    probe.setDate(probe.getDate() - 1);
  }

  // ---- 近 30 天正确率 ----
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 30);
  const recent30 = attempts.filter((a) => a.createdAt >= cutoff && isVerdict(a.aiVerdict));
  const accuracy30d =
    recent30.length === 0
      ? null
      : recent30.filter((a) => a.aiVerdict === "correct").length / recent30.length;

  // ---- 最近作答 ----
  const recentAttempts: RecentAttempt[] = attempts
    .filter((a) => isVerdict(a.aiVerdict) && questionById.has(a.questionId))
    .slice(0, 5)
    .map((a) => {
      const q = questionById.get(a.questionId)!;
      return {
        id: a.id,
        questionId: a.questionId,
        questionTitle: q.title,
        category: q.category,
        verdict: a.aiVerdict as Verdict,
        answeredAt: a.createdAt.toISOString(),
      };
    });

  const masteredQuestions = [...latestVerdict.values()].filter(
    (v) => v === "correct",
  ).length;

  const difficultyBreakdown: DifficultyCount[] = [...difficultyCount.entries()].map(
    ([difficulty, count]) => ({ difficulty, count }),
  );

  return {
    source: "db",
    todayPlan: {
      target: DAILY_TARGET,
      finished: todayStats.count,
      streakDays,
      minutesSpent: Math.round(todayStats.seconds / 60),
    },
    overview: {
      totalQuestions: questions.length,
      masteredQuestions,
      accuracy30d,
      streakDays,
    },
    books: bookProgress,
    wrongAnswers,
    categoryMastery,
    difficultyBreakdown,
    weeklyActivity,
    recentAttempts,
  };
}
