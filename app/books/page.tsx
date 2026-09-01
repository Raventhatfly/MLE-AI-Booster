import type { Metadata } from "next";

import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "MLE 题本 · MLE AI Booster",
};

export default function Page() {
  return (
    <ComingSoon
      title="MLE 题本"
      description="按主题成册的题目集合，每本独立记录进度。进入题本后逐题作答，AI 给出批改、纠错与追问。"
      accent="blue"
    />
  );
}
