import type { Metadata } from "next";

import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "MLE 题库分类器 · MLE AI Booster",
};

export default function Page() {
  return (
    <ComingSoon
      title="MLE 题库分类器"
      description="按知识分类（ML 基础 / 深度学习 / LLM / 系统设计 / Coding / Behavioral）× 难度三档筛选题目，用于定位薄弱环节或做定向训练。"
      accent="crimson"
    />
  );
}
