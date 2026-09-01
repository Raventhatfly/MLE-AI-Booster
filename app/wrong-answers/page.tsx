import type { Metadata } from "next";

import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "错题库 · MLE AI Booster",
};

export default function Page() {
  return (
    <ComingSoon
      title="错题库"
      description="AI 判定为「错误」或「部分正确」的题目会自动进入这里，按到期时间安排复习，直到判定为掌握。"
      accent="garnet"
    />
  );
}
