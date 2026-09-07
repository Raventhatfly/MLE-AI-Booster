import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { QuestionList } from "@/components/QuestionList";
import { SiteHeader } from "@/components/SiteHeader";
import { getBook, listQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  const { bookId } = await params;
  const book = await getBook(bookId);
  return { title: `${book?.name ?? "Book"} · MLE AI Booster` };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = await getBook(bookId);
  if (!book) notFound();

  const questions = await listQuestions({ bookId });
  const pct = book.total > 0 ? Math.round((book.attempted / book.total) * 100) : 0;

  return (
    <div className="flex min-h-full flex-col bg-plane">
      <SiteHeader current="/books" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-6">
        <Link
          href="/books"
          className="text-[12px] text-ink-muted transition-colors hover:text-ink"
        >
          ← All books
        </Link>

        <div className="mt-3 mb-5">
          <h1 className="text-[20px] font-semibold text-ink">{book.name}</h1>
          <p className="mt-1 text-[13px] text-ink-2">{book.description}</p>
          <p className="mt-2 text-[12px] text-ink-muted">
            <span className="tnum">{book.total}</span> questions ·{" "}
            <span className="tnum">{book.attempted}</span> attempted ({pct}%) ·{" "}
            <span className="tnum">{book.mastered}</span> mastered
          </p>
        </div>

        <QuestionList
          questions={questions}
          emptyMessage="This book has no questions yet."
        />
      </main>
    </div>
  );
}
