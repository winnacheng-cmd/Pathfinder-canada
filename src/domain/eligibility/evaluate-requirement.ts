import { parseRuleJson } from "./rule-schema";
import {
  evaluateAnyOf,
  evaluateAtLeastN,
  evaluateAverage,
  evaluateGraduationRequirement,
  evaluateSupplemental,
} from "./evaluators";
import type { EvaluationCore, RequirementEvaluationResult, RequirementInput, StudentCourseInput } from "./types";

/**
 * Dispatches a requirement's rule_json to the correct evaluator. This is the
 * single entry point the rest of the app should call — never call an
 * individual evaluator directly outside tests, since this is what applies
 * the malformed-rule-json → needs_review fallback (a typo in admin-entered
 * JSON must never crash eligibility or silently pass a student).
 */
export function evaluateRequirement(
  requirement: RequirementInput,
  courses: StudentCourseInput[]
): RequirementEvaluationResult {
  const parsed = parseRuleJson(requirement.ruleJson);

  const base = {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    displayText: requirement.displayText,
    trustStatus: requirement.trustStatus,
    sourceSnapshotId: requirement.sourceSnapshotId,
  };

  if (!parsed.success) {
    return {
      ...base,
      status: "needs_review",
      studentValue: null,
      requiredValue: null,
      courseCode: null,
      matchedCourseCodes: [],
      ruleParseError: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }

  const rule = parsed.data;
  let core: EvaluationCore;
  switch (rule.operator) {
    case "ANY_OF":
      core = evaluateAnyOf(rule, courses);
      break;
    case "AT_LEAST_N":
      core = evaluateAtLeastN(rule, courses);
      break;
    case "AVERAGE_OF_SELECTED":
      core = evaluateAverage(rule, courses);
      break;
    case "SUPPLEMENTAL_REQUIRED":
      core = evaluateSupplemental(rule);
      break;
    case "GRADUATION_REQUIREMENT":
      core = evaluateGraduationRequirement(rule);
      break;
  }

  return { ...base, ...core };
}
