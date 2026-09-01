/**
 * Seed script: loads data/seed-questions.json into the local SQLite database and
 * generates a batch of attempts so the dashboard has real data to render.
 *
 * Run: npm run db:seed
 * Idempotent: books and questions are upserted on a stable id / title, so
 * re-running does not duplicate them; attempts are cleared and rebuilt each run
 * rather than accumulating.
 */

// tsx does not auto-load .env, so this is required when running
// `tsx prisma/seed.ts` directly. When run via `prisma db seed`,
// prisma7.config.ts also loads it — loading twice is harmless.
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

/** Fixed script for generating attempts. Deliberately not random, so the
 * dashboard numbers stay stable across re-seeds and code changes are
 * attributable. */
const ATTEMPT_PLAN: {
  /** Days back from today */
  daysAgo: number;
  /** How many questions were answered that day */
  count: number;
  /** Verdict distribution, cycled in order */
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
  correct:
    "Covers the key points and the reasoning is sound. Adding one line on the tradeoff you would make in a real project would make it more convincing.",
  partial:
    "The main conclusion is right, but a key step in the argument is missing. Re-read the highlighted part of the reference answer and try restating it.",
  wrong:
    "The conclusion goes the wrong direction and two core concepts are conflated. Go back to the definitions first, then work through the reference answer in order.",
};

const FOLLOW_UPS: Record<string, string[]> = {
  correct: ["If you relaxed that constraint, would your conclusion still hold?"],
  partial: [
    "What would break if the step you skipped did not hold?",
    "Can you give a counterexample?",
  ],
  wrong: [
    "Start with the definition — how would you state it?",
    "Where exactly do those two concepts diverge?",
  ],
};

async function main() {
  const prisma = getPrisma();

  const raw = readFileSync(join(process.cwd(), "data", "seed-questions.json"), "utf-8");
  const seed = JSON.parse(raw) as SeedFile;

  // ---- Books ----
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
  console.log(`Books: ${seed.books.length}`);

  // ---- Questions (deduped by title, which is unique in the seed file) ----
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
  console.log(`Questions: ${created} created, ${updated} updated`);

  // ---- Attempts: cleared and rebuilt so the seed stays idempotent ----
  const deleted = await prisma.attempt.deleteMany({});
  const questions = await prisma.question.findMany({ select: { id: true } });

  if (questions.length === 0) {
    console.log("Question bank is empty, skipping attempts");
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
      // Stagger times within a day so timestamps are not identical
      answeredAt.setHours(9 + (i % 10), (i * 7) % 60, 0, 0);

      await prisma.attempt.create({
        data: {
          questionId: question.id,
          userAnswer:
            "(seed data) This is where the learner's submitted answer would go.",
          aiVerdict: verdict,
          aiFeedback: FEEDBACK[verdict],
          followUps: serializeFollowUps(FOLLOW_UPS[verdict]),
          // Fixed formula rather than random, so stats stay stable across re-seeds
          durationSec: 120 + ((i * 37) % 400),
          createdAt: answeredAt,
        },
      });
      attemptCount += 1;
    }
  }

  console.log(`Attempts: ${deleted.count} cleared, ${attemptCount} created`);
  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    // better-sqlite3 is synchronous and releases on exit; exit explicitly so
    // tsx does not hang
    process.exit(0);
  });
