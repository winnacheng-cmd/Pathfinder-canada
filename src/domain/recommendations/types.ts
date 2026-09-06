import type { ProgramEvaluationResult } from "@/domain/eligibility/types";

export type ActionType = "add_course" | "improve_grade" | "complete_supplemental" | "review_needed";
export type ActionPriority = "high" | "medium" | "low";

export interface ActionRecommendation {
  /** Stable, derived — same underlying gap always produces the same id, so re-generating the plan doesn't reshuffle unrelated UI state. */
  id: string;
  actionType: ActionType;
  title: string;
  explanation: string;
  priority: ActionPriority;
  affectedProgramIds: string[];
  affectedProgramNames: string[];
  courseCode?: string;
  targetGrade?: number;
  deadline?: string | null;
}

export interface ProgramEvaluationForActions {
  programId: string;
  programName: string;
  evaluation: ProgramEvaluationResult;
}

export interface SupplementalForActions {
  id: string;
  programId: string;
  programName: string;
  title: string;
  deadline: string | null;
}
