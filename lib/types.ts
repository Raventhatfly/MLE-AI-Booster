/**
 * 领域类型。字段刻意与 README 第 4 节的数据模型（Question / Attempt）对齐，
 * 这样阶段 1 接 Prisma 时可以直接由 schema 生成的类型替换本文件，页面不用改。
 */

export type Category =
  | "ML 基础"
  | "深度学习"
  | "LLM / 生成式"
  | "ML 系统设计"
  | "Coding"
  | "Behavioral";

export type Difficulty = "入门" | "进阶" | "困难";

/** AI 批改的判定结果 */
export type Verdict = "correct" | "partial" | "wrong";

export interface Question {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  /** 题目来源，便于追溯是哪次导入 */
  source: string;
}

export interface Attempt {
  id: string;
  questionId: string;
  questionTitle: string;
  category: Category;
  verdict: Verdict;
  /** ISO 日期字符串 */
  answeredAt: string;
}

/** 题本：一组按主题成册的题目，对应「单词书」的概念 */
export interface QuestionBook {
  id: string;
  name: string;
  description: string;
  total: number;
  finished: number;
  /** 是否为当前正在刷的题本 */
  active: boolean;
}

/** 某个分类的掌握情况 */
export interface CategoryMastery {
  category: Category;
  total: number;
  mastered: number;
}

/** 单日刷题量 */
export interface DailyActivity {
  /** 形如 09-01 */
  label: string;
  /** 完整日期，用于 tooltip */
  date: string;
  count: number;
}
