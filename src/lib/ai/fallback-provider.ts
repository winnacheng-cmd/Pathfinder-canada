import type { AiExplanationContext, AiProvider } from "./provider";

/**
 * Deterministic, template-based explanation used whenever no AI key is
 * configured. The product's core value never depends on this — it's the
 * same category of sentence an LLM would produce, built directly from the
 * action engine's own ranked output. See docs/ADMISSIONS_RULES.md.
 */
export class FallbackProvider implements AiProvider {
  async generateExplanation(context: AiExplanationContext): Promise<string> {
    const { counts, topActions } = context;

    if (topActions.length === 0) {
      if (counts.total === 0) {
        return "Save a few target programs and add your courses to get a personalized priority list.";
      }
      return `You currently meet the published requirements for ${counts.eligible} of your ${counts.total} saved programs, with nothing outstanding right now.`;
    }

    const top = topActions[0];
    const programText = top.affectedProgramCount === 1 ? "1 saved program" : `${top.affectedProgramCount} saved programs`;
    const lead = `${top.title} appears to be your highest-leverage priority — it affects ${programText}.`;
    const detail = top.explanation;
    const status = `Right now you meet requirements for ${counts.eligible} of ${counts.total} saved programs${
      counts.needsReview > 0 ? `, and ${counts.needsReview} need re-verification before you rely on them` : ""
    }.`;

    return `${lead} ${detail} ${status}`;
  }
}
