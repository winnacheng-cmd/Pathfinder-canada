import { describe, expect, it } from "vitest";
import { FallbackProvider } from "@/lib/ai/fallback-provider";
import type { AiExplanationContext } from "@/lib/ai/provider";

describe("FallbackProvider", () => {
  it("never invokes any network call and always resolves synchronously from context", async () => {
    const context: AiExplanationContext = {
      counts: { total: 3, eligible: 1, conditionallyEligible: 1, missing: 1, needsReview: 0 },
      topActions: [
        { title: "Add Chemistry 12", explanation: "Required by 2 programs.", priority: "high", affectedProgramCount: 2 },
      ],
    };
    const text = await new FallbackProvider().generateExplanation(context);
    expect(text).toContain("Add Chemistry 12");
    expect(text).toContain("2 saved programs");
    expect(text).toContain("1 of 3");
  });

  it("handles an empty action list without saved programs", async () => {
    const text = await new FallbackProvider().generateExplanation({
      counts: { total: 0, eligible: 0, conditionallyEligible: 0, missing: 0, needsReview: 0 },
      topActions: [],
    });
    expect(text).toContain("Save a few target programs");
  });

  it("handles a fully-eligible profile with nothing outstanding", async () => {
    const text = await new FallbackProvider().generateExplanation({
      counts: { total: 2, eligible: 2, conditionallyEligible: 0, missing: 0, needsReview: 0 },
      topActions: [],
    });
    expect(text).toContain("2 of your 2 saved programs");
  });
});
