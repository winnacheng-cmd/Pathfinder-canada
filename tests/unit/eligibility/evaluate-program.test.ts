import { describe, expect, it } from "vitest";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import type { RequirementInput, StudentCourseInput } from "@/domain/eligibility/types";

function requirement(overrides: Partial<RequirementInput> & { id: string; ruleJson: unknown }): RequirementInput {
  return {
    requirementType: "required_course",
    displayText: overrides.id,
    trustStatus: "verified",
    sourceSnapshotId: "source-1",
    ...overrides,
  };
}

describe("evaluateProgram — build-prompt §83 acceptance case", () => {
  const requirements: RequirementInput[] = [
    requirement({
      id: "chem",
      ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 90 },
    }),
    requirement({
      id: "precalc",
      ruleJson: { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 85 },
    }),
    requirement({
      id: "eng",
      ruleJson: { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 80 },
    }),
  ];

  const courses: StudentCourseInput[] = [
    { courseCode: "CHEM12", status: "completed", gradePercent: 91 },
    { courseCode: "PREC12", status: "completed", gradePercent: 84 },
    { courseCode: "ENG12", status: "completed", gradePercent: 92 },
  ];

  it("evaluates each requirement individually and rolls up to missing_requirements", () => {
    const result = evaluateProgram("program-1", requirements, courses);

    const byId = Object.fromEntries(result.requirements.map((r) => [r.requirementId, r]));
    expect(byId.chem.status).toBe("met");
    expect(byId.precalc.status).toBe("below_minimum");
    expect(byId.precalc.studentValue).toBe(84);
    expect(byId.precalc.requiredValue).toBe(85);
    expect(byId.eng.status).toBe("met");

    expect(result.status).toBe("missing_requirements");
  });

  it("becomes eligible once Pre-Calculus reaches the published minimum (the what-if case)", () => {
    const raisedCourses = courses.map((c) => (c.courseCode === "PREC12" ? { ...c, gradePercent: 85 } : c));
    const result = evaluateProgram("program-1", requirements, raisedCourses);
    expect(result.status).toBe("eligible");
  });
});

describe("evaluateProgram — trust status rollup", () => {
  const courses: StudentCourseInput[] = [{ courseCode: "CHEM12", status: "completed", gradePercent: 91 }];

  it("is fully eligible when every requirement is met and verified", () => {
    const result = evaluateProgram(
      "program-2",
      [requirement({ id: "chem", ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] } })],
      courses
    );
    expect(result.status).toBe("eligible");
    expect(result.provisionalStatus).toBe("eligible");
  });

  it("demotes an otherwise-eligible program to needs_review when the requirement is stale", () => {
    const result = evaluateProgram(
      "program-3",
      [
        requirement({
          id: "chem",
          trustStatus: "stale",
          ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] },
        }),
      ],
      courses
    );
    expect(result.status).toBe("needs_review");
    expect(result.provisionalStatus).toBe("eligible");
    expect(result.requirements[0].status).toBe("met");
  });

  it("treats an unverifiable graduation requirement as a pending item (conditionally_eligible), not a trust demotion", () => {
    const result = evaluateProgram(
      "program-4",
      [
        requirement({
          id: "grad",
          requirementType: "graduation_requirement",
          ruleJson: { operator: "GRADUATION_REQUIREMENT" },
        }),
      ],
      courses
    );
    expect(result.requirements[0].status).toBe("needs_review");
    expect(result.status).toBe("conditionally_eligible");
  });

  it("still reports missing_requirements even if an unrelated requirement is stale", () => {
    const result = evaluateProgram(
      "program-5",
      [
        requirement({ id: "chem", ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] } }),
        requirement({
          id: "phys",
          trustStatus: "stale",
          ruleJson: { operator: "ANY_OF", courseCodes: ["PHYS12"] },
        }),
      ],
      courses
    );
    expect(result.status).toBe("missing_requirements");
  });

  it("is conditionally_eligible when only a supplemental is pending", () => {
    const result = evaluateProgram(
      "program-6",
      [
        requirement({ id: "chem", ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] } }),
        requirement({
          id: "supp",
          requirementType: "supplemental",
          ruleJson: { operator: "SUPPLEMENTAL_REQUIRED", type: "personal_profile" },
        }),
      ],
      courses
    );
    expect(result.status).toBe("conditionally_eligible");
  });
});
