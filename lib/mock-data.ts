/**
 * 本地假数据。阶段 1 接入 Prisma 后，本文件整体替换为数据库查询，
 * 页面只依赖下方导出的形状，不依赖数据来源。
 *
 * 注意：这里没有任何数据库或网络调用，纯常量 —— 因此云端构建期不会连库，
 * 符合 README「构建期绝不能连数据库」的约束。
 */

import type {
  Attempt,
  CategoryMastery,
  DailyActivity,
  Difficulty,
  QuestionBook,
} from "./types";

/** 今日刷题计划 */
export const todayPlan = {
  target: 12,
  finished: 8,
  /** 连续打卡天数 */
  streakDays: 17,
  /** 今日累计用时（分钟） */
  minutesSpent: 43,
};

export const questionBooks: QuestionBook[] = [
  {
    id: "core-300",
    name: "MLE 面试核心 300 题",
    description: "覆盖偏差方差、正则化、评估指标等必考概念",
    total: 300,
    finished: 126,
    active: true,
  },
  {
    id: "dl-principles",
    name: "深度学习原理精讲",
    description: "反向传播、归一化、注意力机制的推导与追问",
    total: 180,
    finished: 47,
    active: false,
  },
  {
    id: "mlsd",
    name: "ML System Design 实战",
    description: "推荐、搜索、排序系统的端到端设计题",
    total: 96,
    finished: 12,
    active: false,
  },
  {
    id: "llm-era",
    name: "LLM 时代面试题",
    description: "RAG、微调策略、推理加速、评测方法",
    total: 140,
    finished: 0,
    active: false,
  },
];

/** 错题库：按分类聚合的待复习错题 */
export const wrongAnswerBank = {
  total: 34,
  /** 今日到期需复习 */
  dueToday: 9,
  byCategory: [
    { category: "深度学习" as const, count: 12 },
    { category: "ML 系统设计" as const, count: 9 },
    { category: "ML 基础" as const, count: 7 },
    { category: "LLM / 生成式" as const, count: 4 },
    { category: "Coding" as const, count: 2 },
  ],
};

/** 分类器：题库按 category × difficulty 的分布 */
export const categoryMastery: CategoryMastery[] = [
  { category: "ML 基础", total: 142, mastered: 98 },
  { category: "深度学习", total: 128, mastered: 61 },
  { category: "LLM / 生成式", total: 96, mastered: 31 },
  { category: "ML 系统设计", total: 84, mastered: 22 },
  { category: "Coding", total: 110, mastered: 74 },
  { category: "Behavioral", total: 56, mastered: 40 },
];

export const difficultyBreakdown: { difficulty: Difficulty; count: number }[] = [
  { difficulty: "入门", count: 246 },
  { difficulty: "进阶", count: 318 },
  { difficulty: "困难", count: 152 },
];

/** 近 7 天刷题量 */
export const weeklyActivity: DailyActivity[] = [
  { label: "08-26", date: "2026-08-26", count: 14 },
  { label: "08-27", date: "2026-08-27", count: 9 },
  { label: "08-28", date: "2026-08-28", count: 16 },
  { label: "08-29", date: "2026-08-29", count: 4 },
  { label: "08-30", date: "2026-08-30", count: 11 },
  { label: "08-31", date: "2026-08-31", count: 13 },
  { label: "09-01", date: "2026-09-01", count: 8 },
];

export const recentAttempts: Attempt[] = [
  {
    id: "a1",
    questionId: "q-101",
    questionTitle: "为什么 Batch Normalization 在推理时要用移动平均统计量？",
    category: "深度学习",
    verdict: "partial",
    answeredAt: "2026-09-01T10:42:00Z",
  },
  {
    id: "a2",
    questionId: "q-088",
    questionTitle: "AUC 和 PR-AUC 在正负样本极度不平衡时该选哪个，为什么？",
    category: "ML 基础",
    verdict: "correct",
    answeredAt: "2026-09-01T10:21:00Z",
  },
  {
    id: "a3",
    questionId: "q-233",
    questionTitle: "设计一个短视频推荐系统的召回层，说明多路召回如何融合",
    category: "ML 系统设计",
    verdict: "wrong",
    answeredAt: "2026-09-01T09:58:00Z",
  },
  {
    id: "a4",
    questionId: "q-190",
    questionTitle: "RAG 中检索结果与生成结果不一致时，有哪些定位手段？",
    category: "LLM / 生成式",
    verdict: "partial",
    answeredAt: "2026-08-31T15:30:00Z",
  },
  {
    id: "a5",
    questionId: "q-045",
    questionTitle: "L1 和 L2 正则化为什么一个产生稀疏解、一个不产生？",
    category: "ML 基础",
    verdict: "correct",
    answeredAt: "2026-08-31T14:55:00Z",
  },
];

/** 顶部 KPI */
export const overview = {
  totalQuestions: categoryMastery.reduce((s, c) => s + c.total, 0),
  masteredQuestions: categoryMastery.reduce((s, c) => s + c.mastered, 0),
  /** 近 30 天 AI 批改判定为 correct 的比例 */
  accuracy30d: 0.68,
  streakDays: todayPlan.streakDays,
};
