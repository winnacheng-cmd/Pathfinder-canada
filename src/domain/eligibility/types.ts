import type {
  CourseStatus,
  RequirementTrustStatus,
  RequirementType,
} from "@/types/database";

/** Per-requirement outcome for one student. Never hides uncertainty — see docs/ADMISSIONS_RULES.md. */
export type RequirementEvaluationStatus =
  | "met"
  | "missing_course"
  | "below_minimum"
  | "planned"
  | "in_progress"
  | "unknown_grade"
  | "supplemental_required"
  | "needs_review";

/** Program-level rollup. "needs_review" always wins over eligible/conditionally_eligible
 * when a requirement backing that conclusion is unverified — but never masks a clear
 * missing_requirements signal. See evaluate-program.ts. */
export type ProgramEvaluationStatus =
  | "eligible"
  | "conditionally_eligible"
  | "missing_requirements"
  | "needs_review";

export interface StudentCourseInput {
  courseCode: string;
  status: CourseStatus;
  gradePercent?: number | null;
  predictedGradePercent?: number | null;
}

export interface RequirementInput {
  id: string;
  requirementType: RequirementType;
  ruleJson: unknown;
  displayText: string;
  trustStatus: RequirementTrustStatus;
  sourceSnapshotId: string | null;
}

export interface RequirementEvaluationResult {
  requirementId: string;
  requirementType: RequirementType;
  status: RequirementEvaluationStatus;
  displayText: string;
  trustStatus: RequirementTrustStatus;
  sourceSnapshotId: string | null;
  studentValue: number | null;
  requiredValue: number | null;
  courseCode: string | null;
  matchedCourseCodes: string[];
  /** Set only when rule_json failed schema validation — treated as needs_review. */
  ruleParseError?: string;
}

export interface ProgramEvaluationResult {
  programId: string;
  status: ProgramEvaluationStatus;
  /** What the status would be ignoring requirement trust (verified/needs_review/stale). */
  provisionalStatus: Exclude<ProgramEvaluationStatus, "needs_review">;
  requirements: RequirementEvaluationResult[];
}

/** Shared core returned by each operator-specific evaluator before it's
 * wrapped into a full RequirementEvaluationResult by evaluateRequirement(). */
export interface EvaluationCore {
  status: RequirementEvaluationStatus;
  studentValue: number | null;
  requiredValue: number | null;
  courseCode: string | null;
  matchedCourseCodes: string[];
}
