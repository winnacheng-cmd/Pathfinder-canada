import { describe, expect, it } from "vitest";
import { evaluateRequirement } from "@/domain/eligibility/evaluate-requirement";
import type { RequirementInput, StudentCourseInput } from "@/domain/eligibility/types";

function requirement(overrides: Partial<RequirementInput> & { ruleJson: unknown }): RequirementInput {
  return {
    id: "req-1",
    requirementType: "required_course",
    displayText: "Requirement",
    trustStatus: "verified",
    sourceSnapshotId: "source-1",
    ...overrides,
  };
}

describe("evaluateRequirement — dispatcher", () => {
  it("reports supplemental_required for a SUPPLEMENTAL_REQUIRED rule", () => {
    const result = evaluateRequirement(
      requirement({
        requirementType: "supplemental",
        ruleJson: { operator: "SUPPLEMENTAL_REQUIRED", type: "personal_profile" },
      }),
      []
    );
    expect(result.status).toBe("supplemental_required");
  });

  it("reports needs_review for a GRADUATION_REQUIREMENT rule (can't be verified from course data)", () => {
    const result = evaluateRequirement(
      requirement({
        requirementType: "graduation_requirement",
        ruleJson: { operator: "GRADUATION_REQUIREMENT" },
      }),
      []
    );
    expect(result.status).toBe("needs_review");
  });

  it("falls back to needs_review with a parse error when rule_json is malformed", () => {
    const result = evaluateRequirement(
      requirement({ ruleJson: { operator: "NOT_A_REAL_OPERATOR", foo: "bar" } }),
      []
    );
    expect(result.status).toBe("needs_review");
    expect(result.ruleParseError).toBeTruthy();
  });

  it("preserves the requirement's trustStatus regardless of evaluation outcome", () => {
    const courses: StudentCourseInput[] = [{ courseCode: "CHEM12", status: "completed", gradePercent: 91 }];
    const result = evaluateRequirement(
      requirement({
        trustStatus: "stale",
        ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 80 },
      }),
      courses
    );
    expect(result.status).toBe("met");
    expect(result.trustStatus).toBe("stale");
  });
});
