import type { Metadata } from "next";

import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Question Classifier · MLE AI Booster",
};

export default function Page() {
  return (
    <ComingSoon
      title="Question Classifier"
      description="Filter the bank by knowledge area (ML Fundamentals, Deep Learning, LLM / GenAI, System Design, Coding, Behavioral) and by difficulty, to target weak spots or drill a specific topic."
      accent="crimson"
    />
  );
}
