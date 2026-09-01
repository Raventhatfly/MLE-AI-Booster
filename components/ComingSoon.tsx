import Link from "next/link";

import { BrandMark } from "@/components/BrandMark";

/** 阶段 1 未完成的模块占位页，避免 dashboard 上的入口点进去 404。 */
export function ComingSoon({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: "blue" | "garnet" | "crimson";
}) {
  const bar =
    accent === "blue"
      ? "bg-brand-blue"
      : accent === "garnet"
        ? "bg-brand-garnet"
        : "bg-brand-crimson";

  return (
    <div className="flex min-h-full flex-col bg-plane">
      <header className="border-b border-hairline bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
          <BrandMark />
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            ← 回到总览
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface p-8">
          <span className={`absolute inset-x-0 top-0 h-[3px] ${bar}`} />
          <h1 className="text-[20px] font-semibold text-ink">{title}</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-2">
            {description}
          </p>
          <p className="mt-6 text-[12px] text-ink-muted">
            本页在阶段 1 实现。当前只完成了主界面 dashboard。
          </p>
        </div>
      </main>
    </div>
  );
}
