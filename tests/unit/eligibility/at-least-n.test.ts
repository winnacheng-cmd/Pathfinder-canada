import { describe, expect, it } from "vitest";
import { evaluateAtLeastN } from "@/domain/eligibility/evaluators";
import type { StudentCourseInput } from "@/domain/eligibility/types";

function course(overrides: Partial<StudentCourseInput> & { courseCode: string }): StudentCourseInput {
  return { status: "completed", ...overrides };
}

describe("evaluateAtLeastN — choose-N group", () => {
  it("succeeds when at least n of the group are completed", () => {
    const result = evaluateAtLeastN(
      { operator: "AT_LEAST_N", n: 2, courseCodes: ["CHEM12", "PHYS12", "BIOL12"] },
      [
        course({ courseCode: "CHEM12", status: "completed" }),
        course({ courseCode: "BIOL12", status: "completed" }),
      ]
    );
    expect(result.status).toBe("met");
    expect(result.matchedCourseCodes).toHaveLength(2);
  });

  it("fails when fewer than n are even in the student's plan", () => {
    const result = evaluateAtLeastN(
      { operator: "AT_LEAST_N", n: 2, courseCodes: ["CHEM12", "PHYS12", "BIOL12"] },
      [course({ courseCode: "CHEM12", status: "completed" })]
    );
    expect(result.status).toBe("missing_course");
  });

  it("reports below_minimum when enough are attempted but grades fall short", () => {
    const result = evaluateAtLeastN(
      {
        operator: "AT_LEAST_N",
        n: 2,
        courseCodes: ["CHEM12", "PHYS12", "BIOL12"],
        minimumGrade: 85,
      },
      [
        course({ courseCode: "CHEM12", status: "completed", gradePercent: 90 }),
        course({ courseCode: "PHYS12", status: "completed", gradePercent: 70 }),
      ]
    );
    expect(result.status).toBe("below_minimum");
  });

  it("reports planned when the shortfall is only courses not yet started", () => {
    const result = evaluateAtLeastN(
      { operator: "AT_LEAST_N", n: 2, courseCodes: ["CHEM12", "PHYS12", "BIOL12"] },
      [
        course({ courseCode: "CHEM12", status: "completed" }),
        course({ courseCode: "PHYS12", status: "planned" }),
      ]
    );
    expect(result.status).toBe("planned");
  });
});
