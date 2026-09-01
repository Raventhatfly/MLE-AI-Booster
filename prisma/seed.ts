/**
 * 种子脚本：把 data/seed-questions.json 导入本地 SQLite，并造一批作答记录，
 * 让 dashboard 有真实数据可显示。
 *
 * 运行：npm run db:seed
 * 幂等：题本和题目按稳定 id / 标题 upsert，重复跑不会产生重复数据；
 *       作答记录会先清空再重建，避免每次运行都累积。
 */

// tsx 不会自动加载 .env，直接 `tsx prisma/seed.ts` 运行时需要这一行；
// 经 `prisma db seed` 运行时 prisma7.config.ts 也会加载，重复加载无副作用。
import "dotenv/config";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getPrisma, serializeFollowUps } from "../lib/db";

interface SeedBook {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

interface SeedQuestion {
  bookId: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  referenceAnswer: string;
  source: string;
}

interface SeedFile {
  books: SeedBook[];
  questions: SeedQuestion[];
}

/** 造作答记录用的固定脚本，避免随机导致每次 seed 后 dashboard 数字乱跳 */
const ATTEMPT_PLAN: {
  /** 距今天多少天 */
  daysAgo: number;
  /** 当天答了几题 */
  count: number;
  /** 判定分布，按顺序循环取用 */
  verdicts: ("correct" | "partial" | "wrong")[];
}[] = [
  { daysAgo: 6, count: 14, verdicts: ["correct", "correct", "partial", "wrong"] },
  { daysAgo: 5, count: 9, verdicts: ["correct", "partial", "correct"] },
  { daysAgo: 4, count: 16, verdicts: ["correct", "correct", "correct", "wrong"] },
  { daysAgo: 3, count: 4, verdicts: ["partial", "wrong"] },
  { daysAgo: 2, count: 11, verdicts: ["correct", "correct", "partial"] },
  { daysAgo: 1, count: 13, verdicts: ["correct", "partial", "correct", "wrong"] },
  { daysAgo: 0, count: 8, verdicts: ["correct", "correct", "partial"] },
];

const FEEDBACK: Record<string, string> = {
  correct: "要点覆盖完整，推导方向正确。可以再补一句实际项目中的取舍依据，回答会更有说服力。",
  partial: "主要结论对了，但遗漏了关键的一步论证。建议回看参考答案中被标出的那部分再复述一遍。",
  wrong: "结论方向偏了，核心概念混淆。建议先回到定义，再按参考答案的顺序重新梳理一遍。",
};

const FOLLOW_UPS: Record<string, string[]> = {
  correct: ["如果把这个约束放宽，你的结论还成立吗？"],
  partial: ["你遗漏的那一步，如果不成立会导致什么后果？", "能举一个反例吗？"],
  wrong: ["先说说这个概念的定义？", "你混淆的那两个概念，区别在哪一步？"],
};

async function main() {
  const prisma = getPrisma();

  const raw = readFileSync(join(process.cwd(), "data", "seed-questions.json"), "utf-8");
  const seed = JSON.parse(raw) as SeedFile;

  // ---- 题本 ----
  for (const book of seed.books) {
    await prisma.questionBook.upsert({
      where: { id: book.id },
      create: {
        id: book.id,
        name: book.name,
        description: book.description,
        sortOrder: book.sortOrder,
      },
      update: {
        name: book.name,
        description: book.description,
        sortOrder: book.sortOrder,
      },
    });
  }
  console.log(`题本: ${seed.books.length} 本`);

  // ---- 题目（按 title 判重，title 在种子数据里是唯一的）----
  let created = 0;
  let updated = 0;
  for (const q of seed.questions) {
    const existing = await prisma.question.findFirst({
      where: { title: q.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          content: q.content,
          category: q.category,
          difficulty: q.difficulty,
          referenceAnswer: q.referenceAnswer,
          source: q.source,
          bookId: q.bookId,
        },
      });
      updated += 1;
    } else {
      await prisma.question.create({
        data: {
          title: q.title,
          content: q.content,
          category: q.category,
          difficulty: q.difficulty,
          referenceAnswer: q.referenceAnswer,
          source: q.source,
          bookId: q.bookId,
        },
      });
      created += 1;
    }
  }
  console.log(`题目: 新增 ${created} 道，更新 ${updated} 道`);

  // ---- 作答记录：先清空再重建，保证幂等 ----
  const deleted = await prisma.attempt.deleteMany({});
  const questions = await prisma.question.findMany({ select: { id: true } });

  if (questions.length === 0) {
    console.log("题库为空，跳过作答记录");
    return;
  }

  let attemptCount = 0;
  let cursor = 0;
  const now = new Date();

  for (const day of ATTEMPT_PLAN) {
    for (let i = 0; i < day.count; i += 1) {
      const question = questions[cursor % questions.length];
      cursor += 1;

      const verdict = day.verdicts[i % day.verdicts.length];

      const answeredAt = new Date(now);
      answeredAt.setDate(answeredAt.getDate() - day.daysAgo);
      // 同一天内按顺序错开时间，避免时间戳完全相同
      answeredAt.setHours(9 + (i % 10), (i * 7) % 60, 0, 0);

      await prisma.attempt.create({
        data: {
          questionId: question.id,
          userAnswer: "（种子数据）这里是学习者当时提交的回答正文。",
          aiVerdict: verdict,
          aiFeedback: FEEDBACK[verdict],
          followUps: serializeFollowUps(FOLLOW_UPS[verdict]),
          // 用固定公式而非随机数，保证重复 seed 后统计数字稳定
          durationSec: 120 + ((i * 37) % 400),
          createdAt: answeredAt,
        },
      });
      attemptCount += 1;
    }
  }

  console.log(`作答记录: 清空 ${deleted.count} 条，新建 ${attemptCount} 条`);
  console.log("seed 完成");
}

main()
  .catch((e) => {
    console.error("seed 失败:", e);
    process.exit(1);
  })
  .finally(() => {
    // better-sqlite3 是同步驱动，进程结束即释放；这里显式退出避免 tsx 挂住
    process.exit(0);
  });
