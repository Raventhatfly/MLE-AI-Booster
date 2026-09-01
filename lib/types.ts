/**
 * 领域类型。字段与 README 第 4 节的数据模型（Question / Attempt）对齐。
 *
 * 关于 category / difficulty / verdict：SQLite 不支持枚举，数据库里存的是
 * String。下面的联合类型是「写入侧」的约束（种子数据、AI 批改结果都应落在
 * 这些取值里），而「读取侧」的展示类型用 string —— 因为从数据库读出来的值
 * 无法在类型层面保证一定属于联合，强行断言只会把问题藏起来。
 */

export const CATEGORIES = [
  "ML 基础",
  "深度学习",
  "LLM / 生成式",
  "ML 系统设计",
  "Coding",
  "Behavioral",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ["入门", "进阶", "困难"] as const;

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
