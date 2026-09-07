/**
 * Merge a batch of questions into data/seed-questions.json.
 *
 * Usage: node scripts/merge-questions.mjs <batch.json> [...more]
 *
 * A batch file is a JSON array of question objects. Titles are the dedup key,
 * matching the seed script, so re-running a batch is a no-op rather than a
 * duplicate. Every question is validated against the category and difficulty
 * unions before being written, so a typo fails here instead of silently
 * becoming a new category on the dashboard.
 */

import { readFileSync, writeFileSync } from "node:fs";

const SEED_PATH = "data/seed-questions.json";

const CATEGORIES = new Set([
  "ML Fundamentals",
  "Deep Learning",
  "LLM / GenAI",
  "ML System Design",
  "Coding",
  "Behavioral",
]);
const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);
const FIELDS = [
  "bookId",
  "title",
  "content",
  "category",
  "difficulty",
  "referenceAnswer",
  "source",
];

const batchPaths = process.argv.slice(2);
if (batchPaths.length === 0) {
  console.error("usage: node scripts/merge-questions.mjs <batch.json> [...]");
  process.exit(1);
}

const seed = JSON.parse(readFileSync(SEED_PATH, "utf-8"));
const bookIds = new Set(seed.books.map((b) => b.id));
const seen = new Set(seed.questions.map((q) => q.title));

let added = 0;
let skipped = 0;
const problems = [];

for (const path of batchPaths) {
  const batch = JSON.parse(readFileSync(path, "utf-8"));
  for (const q of batch) {
    if (!CATEGORIES.has(q.category)) {
      problems.push(`unknown category "${q.category}" in: ${q.title}`);
      continue;
    }
    if (!DIFFICULTIES.has(q.difficulty)) {
      problems.push(`unknown difficulty "${q.difficulty}" in: ${q.title}`);
      continue;
    }
    if (!bookIds.has(q.bookId)) {
      problems.push(`unknown bookId "${q.bookId}" in: ${q.title}`);
      continue;
    }
    for (const f of ["title", "content", "referenceAnswer"]) {
      if (!q[f] || String(q[f]).trim().length < 10) {
        problems.push(`field "${f}" too short in: ${q.title}`);
      }
    }
    if (seen.has(q.title)) {
      skipped += 1;
      continue;
    }
    seen.add(q.title);
    const row = {};
    for (const f of FIELDS) row[f] = f === "source" ? (q.source ?? "seed/manual") : q[f];
    seed.questions.push(row);
    added += 1;
  }
}

if (problems.length > 0) {
  console.error("Validation failed:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2) + "\n", "utf-8");

const byCat = {};
const byDiff = {};
for (const q of seed.questions) {
  byCat[q.category] = (byCat[q.category] ?? 0) + 1;
  byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1;
}
console.log(`added ${added}, skipped ${skipped} duplicates, total ${seed.questions.length}`);
console.log("by category:", byCat);
console.log("by difficulty:", byDiff);
