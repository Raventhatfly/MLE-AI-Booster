import { redirect } from "next/navigation";

import { getRandomQuestion } from "@/lib/questions";

export const dynamic = "force-dynamic";

/**
 * Redirects to a question worth practising: prefers never-attempted, then
 * anything not yet mastered, and only repeats mastered questions when the
 * whole bank is done. Implemented as a route handler rather than a page so
 * the URL bar ends up on the question itself.
 */
export async function GET() {
  const q = await getRandomQuestion();
  redirect(q ? `/questions/${q.id}` : "/classifier");
}
