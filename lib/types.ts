/**
 * Domain types, aligned with the Question / Attempt models in README section 4.
 *
 * On category / difficulty / verdict: SQLite has no enums, so these are stored
 * as String. The union types below constrain the WRITE side (seed data and AI
 * grading output must land on these values). The READ side uses plain string,
 * because a value coming back from the database cannot be proven to belong to
 * the union at the type level — asserting it would only hide the problem.
 */

export const CATEGORIES = [
  "ML Fundamentals",
  "Deep Learning",
  "LLM / GenAI",
  "ML System Design",
  "Coding",
  "Behavioral",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

/** AI 批改的判定结果 */
export type Verdict = "correct" | "partial" | "wrong";

export function isVerdict(v: string | null | undefined): v is Verdict {
  return v === "correct" || v === "partial" || v === "wrong";
}

/** 最近作答记录的展示形状 */
export interface RecentAttempt {
  id: string;
  questionId: string;
  questionTitle: string;
  category: string;
  verdict: Verdict;
  /** ISO 日期字符串 */
  answeredAt: string;
}

/** 题本进度 */
export interface BookProgress {
  id: string;
  name: string;
  description: string;
  total: number;
  /** 至少作答过一次的题目数 */
  finished: number;
}

/** 某个分类的掌握情况。mastered 的口径见 lib/data.ts */
export interface CategoryMastery {
  category: string;
  total: number;
  mastered: number;
}

/** 单日刷题量 */
export interface DailyActivity {
  /** 形如 09-01 */
  label: string;
  /** 完整日期 YYYY-MM-DD */
  date: string;
  count: number;
}

/** 难度分布 */
export interface DifficultyCount {
  difficulty: string;
  count: number;
}

/** 错题库聚合 */
export interface WrongAnswerSummary {
  /** 最近一次判定为 wrong 或 partial 的题目数 */
  total: number;
  /** 其中判定为 wrong 的 */
  wrongCount: number;
  /** 其中判定为 partial 的 */
  partialCount: number;
  byCategory: { category: string; count: number }[];
}

/** 今日计划 */
export interface TodayPlan {
  target: number;
  finished: number;
  streakDays: number;
  minutesSpent: number;
}

/** dashboard 需要的全部数据 */
export interface DashboardData {
  /** 数据来源：db = 本地数据库；seed = 无数据库时的只读降级 */
  source: "db" | "seed";
  todayPlan: TodayPlan;
  overview: {
    totalQuestions: number;
    masteredQuestions: number;
    /** 近 30 天判定为 correct 的比例，0-1；无数据时为 null */
    accuracy30d: number | null;
    streakDays: number;
  };
  books: BookProgress[];
  wrongAnswers: WrongAnswerSummary;
  categoryMastery: CategoryMastery[];
  difficultyBreakdown: DifficultyCount[];
  weeklyActivity: DailyActivity[];
  recentAttempts: RecentAttempt[];
}
