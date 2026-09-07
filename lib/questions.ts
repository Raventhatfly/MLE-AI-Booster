import seedFile from "@/data/seed-questions.json";

import { isVerdict, type Verdict } from "./types";

/**
 * Question browsing queries, used by the books / classifier / mistake-bank pages.
 *
 * Same two-shape rule as lib/data.ts: with DATABASE_URL we read the local
 * SQLite database; without it we fall back to the bundled seed file so the
 * cloud deployment can still browse the question bank read-only. Anything that
 * depends on attempt history is simply absent in the fallback rather than faked.
 */

export interface QuestionSummary {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  bookId: string | null;
  /** Latest verdict for this question, or null if never attempted */
  latestVerdict: Verdict | null;
  attemptCount: number;
}

export interface QuestionDetail extends QuestionSummary {
  content: string;
  referenceAnswer: string;
  source: string;
  bookName: string | null;
  attempts: {
    id: string;
    userAnswer: string;
    verdict: Verdict | null;
    feedback: string | null;
    followUps: string[];
    createdAt: string;
  }[];
}

export interface BookSummary {
  id: string;
  name: string;
  description: string;
  total: number;
  attempted: number;
  mastered: number;
}

export interface QuestionFilter {
  bookId?: string;
  category?: string;
  difficulty?: string;
  /** "unattempted" plus the three verdicts */
  status?: "unattempted" | Verdict;
}

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Stable synthetic id for seed-only mode, where rows have no database id. */
function seedId(index: number): string {
  return `seed-${index}`;
}

/* ------------------------------------------------------------------ *
 * Books
 * ------------------------------------------------------------------ */

export async function getBooks(): Promise<BookSummary[]> {
  if (!hasDatabase()) {
    return seedFile.books.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      total: seedFile.questions.filter((q) => q.bookId === b.id).length,
      attempted: 0,
      mastered: 0,
    }));
  }

  const { getPrisma } = await import("./db");
  const prisma = getPrisma();

  const [books, questions, attempts] = await Promise.all([
    prisma.questionBook.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.question.findMany({ select: { id: true, bookId: true } }),
    prisma.attempt.findMany({
      select: { questionId: true, aiVerdict: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const latest = latestVerdictMap(attempts);
  const attemptedIds = new Set(attempts.map((a) => a.questionId));

  return books.map((b) => {
    const inBook = questions.filter((q) => q.bookId === b.id);
    return {
      id: b.id,
      name: b.name,
      description: b.description,
      total: inBook.length,
      attempted: inBook.filter((q) => attemptedIds.has(q.id)).length,
      mastered: inBook.filter((q) => latest.get(q.id) === "correct").length,
    };
  });
}

export async function getBook(bookId: string): Promise<BookSummary | null> {
  const books = await getBooks();
  return books.find((b) => b.id === bookId) ?? null;
}

/* ------------------------------------------------------------------ *
 * Question lists
 * ------------------------------------------------------------------ */

export async function listQuestions(
  filter: QuestionFilter = {},
): Promise<QuestionSummary[]> {
  if (!hasDatabase()) {
    return seedFile.questions
      .map((q, i) => ({
        id: seedId(i),
        title: q.title,
        category: q.category,
        difficulty: q.difficulty,
        bookId: q.bookId ?? null,
        latestVerdict: null,
        attemptCount: 0,
      }))
      .filter((q) => matches(q, filter));
  }

  const { getPrisma } = await import("./db");
  const prisma = getPrisma();

  const [questions, attempts] = await Promise.all([
    prisma.question.findMany({
      where: {
        bookId: filter.bookId,
        category: filter.category,
        difficulty: filter.difficulty,
      },
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        bookId: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.attempt.findMany({
      select: { questionId: true, aiVerdict: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const latest = latestVerdictMap(attempts);
  const counts = new Map<string, number>();
  for (const a of attempts) {
    counts.set(a.questionId, (counts.get(a.questionId) ?? 0) + 1);
  }

  return questions
    .map((q) => ({
      id: q.id,
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      bookId: q.bookId,
      latestVerdict: latest.get(q.id) ?? null,
      attemptCount: counts.get(q.id) ?? 0,
    }))
    .filter((q) => matches(q, filter));
}

/** Questions whose most recent attempt was wrong or partial. */
export async function listMistakes(): Promise<QuestionSummary[]> {
  const all = await listQuestions();
  return all.filter(
    (q) => q.latestVerdict === "wrong" || q.latestVerdict === "partial",
  );
}

/* ------------------------------------------------------------------ *
 * Question detail
 * ------------------------------------------------------------------ */

export async function getQuestion(id: string): Promise<QuestionDetail | null> {
  if (!hasDatabase()) {
    const index = Number(id.replace(/^seed-/, ""));
    const q = seedFile.questions[index];
    if (!q) return null;
    const book = seedFile.books.find((b) => b.id === q.bookId);
    return {
      id,
      title: q.title,
      content: q.content,
      category: q.category,
      difficulty: q.difficulty,
      referenceAnswer: q.referenceAnswer,
      source: q.source,
      bookId: q.bookId ?? null,
      bookName: book?.name ?? null,
      latestVerdict: null,
      attemptCount: 0,
      attempts: [],
    };
  }

  const { getPrisma, parseFollowUps } = await import("./db");
  const prisma = getPrisma();

  const q = await prisma.question.findUnique({
    where: { id },
    include: {
      book: { select: { name: true } },
      attempts: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!q) return null;

  const latest = q.attempts.find((a) => isVerdict(a.aiVerdict));

  return {
    id: q.id,
    title: q.title,
    content: q.content,
    category: q.category,
    difficulty: q.difficulty,
    referenceAnswer: q.referenceAnswer,
    source: q.source,
    bookId: q.bookId,
    bookName: q.book?.name ?? null,
    latestVerdict: latest && isVerdict(latest.aiVerdict) ? latest.aiVerdict : null,
    attemptCount: q.attempts.length,
    attempts: q.attempts.map((a) => ({
      id: a.id,
      userAnswer: a.userAnswer,
      verdict: isVerdict(a.aiVerdict) ? a.aiVerdict : null,
      feedback: a.aiFeedback,
      followUps: parseFollowUps(a.followUps),
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

/** Pick a question to practise next: prefer never-attempted, else not mastered. */
export async function getRandomQuestion(
  filter: QuestionFilter = {},
): Promise<QuestionSummary | null> {
  const all = await listQuestions(filter);
  if (all.length === 0) return null;
  const pool =
    all.filter((q) => q.latestVerdict === null).length > 0
      ? all.filter((q) => q.latestVerdict === null)
      : all.filter((q) => q.latestVerdict !== "correct");
  const candidates = pool.length > 0 ? pool : all;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

function latestVerdictMap(
  attempts: { questionId: string; aiVerdict: string | null }[],
): Map<string, Verdict> {
  // attempts must already be ordered newest first
  const latest = new Map<string, Verdict>();
  for (const a of attempts) {
    if (latest.has(a.questionId)) continue;
    if (isVerdict(a.aiVerdict)) latest.set(a.questionId, a.aiVerdict);
  }
  return latest;
}

function matches(q: QuestionSummary, filter: QuestionFilter): boolean {
  if (filter.bookId && q.bookId !== filter.bookId) return false;
  if (filter.category && q.category !== filter.category) return false;
  if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
  if (filter.status) {
    if (filter.status === "unattempted") return q.latestVerdict === null;
    return q.latestVerdict === filter.status;
  }
  return true;
}
