import { evaluateRequirement } from "./evaluate-requirement";
import type { ProgramEvaluationResult, RequirementInput, StudentCourseInput } from "./types";

const BLOCKER_STATUSES = new Set([
  "missing_course",
  "below_minimum",
  "unknown_grade",
  "in_progress",
  "planned",
]);

const PENDING_STATUSES = new Set(["supplemental_required", "needs_review"]);

/**
 * Combines every requirement's result into one program-level status.
 *
 * Precedence (see docs/ADMISSIONS_RULES.md "Trust status vs. evaluation
 * status"): a clear academic gap (missing_requirements) is always surfaced,
 * even if some unrelated requirement on the same program is stale — that's
 * the most actionable signal and trust concerns elsewhere shouldn't bury it.
 * But we never confidently call a program "eligible" or
 * "conditionally_eligible" if any requirement backing that conclusion is
 * unverified — that becomes "needs_review" instead. Per-requirement results
 * keep their own trustStatus untouched either way, so the UI can always
 * show the specific stale/needs-review row.
 */
export function evaluateProgram(
  programId: string,
  requirements: RequirementInput[],
  courses: StudentCourseInput[]
): ProgramEvaluationResult {
  const results = requirements.map((requirement) => evaluateRequirement(requirement, courses));

  const hasBlocker = results.some((r) => BLOCKER_STATUSES.has(r.status));
  const hasPending = results.some((r) => PENDING_STATUSES.has(r.status));

  const provisionalStatus = hasBlocker
    ? ("missing_requirements" as const)
    : hasPending
      ? ("conditionally_eligible" as const)
      : ("eligible" as const);

  const hasUnverifiedTrust = requirements.some((r) => r.trustStatus !== "verified");

  const status =
    provisionalStatus === "missing_requirements"
      ? provisionalStatus
      : hasUnverifiedTrust
        ? ("needs_review" as const)
        : provisionalStatus;

  return { programId, status, provisionalStatus, requirements: results };
}
