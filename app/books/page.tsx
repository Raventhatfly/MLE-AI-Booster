import type { Metadata } from "next";

import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "MLE Question Books · MLE AI Booster",
};

export default function Page() {
  return (
    <ComingSoon
      title="MLE Question Books"
      description="Themed collections of interview questions, each tracking its own progress. Work through a book question by question and get AI grading, corrections, and follow-ups."
      accent="blue"
    />
  );
}
