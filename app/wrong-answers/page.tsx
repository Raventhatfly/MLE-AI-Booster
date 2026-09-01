import type { Metadata } from "next";

import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Mistake Bank · MLE AI Booster",
};

export default function Page() {
  return (
    <ComingSoon
      title="Mistake Bank"
      description="Questions whose most recent attempt was graded incorrect or partially correct land here automatically, scheduled for review until you get them right."
      accent="garnet"
    />
  );
}
