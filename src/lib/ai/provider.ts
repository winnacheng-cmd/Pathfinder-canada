export interface AiExplanationAction {
  title: string;
  explanation: string;
  priority: "high" | "medium" | "low";
  affectedProgramCount: number;
}

/**
 * Everything an explanation is grounded in — never the student's email,
 * account id, or raw free-text. Just the already-computed, already-public
 * (to the student) structured output of the eligibility/action engines. See
 * docs/PRIVACY.md "AI and privacy".
 */
export interface AiExplanationContext {
  counts: {
    total: number;
    eligible: number;
    conditionallyEligible: number;
    missing: number;
    needsReview: number;
  };
  topActions: AiExplanationAction[];
}

export interface AiProvider {
  generateExplanation(context: AiExplanationContext): Promise<string>;
}
