import { NextResponse } from "next/server";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getActionPlanData } from "@/lib/queries/action-plan";
import { getAiProvider } from "@/lib/ai";
import { FallbackProvider } from "@/lib/ai/fallback-provider";
import type { AiExplanationContext } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

/**
 * Derives the AI context entirely server-side from the caller's own saved
 * programs — never trusts a client-supplied context, so there's no way to
 * ask the model to explain someone else's profile or inject arbitrary
 * "facts" into the prompt. See docs/PRIVACY.md "AI and privacy".
 */
export async function POST() {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) {
    return NextResponse.json({ error: "Complete onboarding first." }, { status: 401 });
  }

  const { actions, counts } = await getActionPlanData(profile);

  const context: AiExplanationContext = {
    counts: {
      total: counts.total,
      eligible: counts.eligible,
      conditionallyEligible: counts.conditionallyEligible,
      missing: counts.missing,
      needsReview: counts.needsReview,
    },
    topActions: actions.slice(0, 3).map((a) => ({
      title: a.title,
      explanation: a.explanation,
      priority: a.priority,
      affectedProgramCount: a.affectedProgramIds.length,
    })),
  };

  const { provider, usingFallback } = getAiProvider();

  try {
    const explanation = await provider.generateExplanation(context);
    return NextResponse.json({ explanation, source: usingFallback ? "fallback" : "ai" });
  } catch (err) {
    // A misconfigured/unreachable AI provider must never break the product —
    // fall back to the deterministic explanation instead of erroring out.
    console.error("AI provider failed, falling back:", err instanceof Error ? err.message : err);
    const explanation = await new FallbackProvider().generateExplanation(context);
    return NextResponse.json({ explanation, source: "fallback" });
  }
}
