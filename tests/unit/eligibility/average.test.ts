import { describe, expect, it } from "vitest";
import { evaluateAverage } from "@/domain/eligibility/evaluators";
import type { StudentCourseInput } from "@/domain/eligibility/types";

function course(overrides: Partial<StudentCourseInput> & { courseCode: string }): StudentCourseInput {
  return { status: "completed", ...overrides };
}

const rule = {
  operator: "AVERAGE_OF_SELECTED" as const,
  courseCodes: ["ENG12", "PREC12", "CHEM12", "BIOL12"],
  minimum: 85,
};

describe("evaluateAverage — overall average minimum", () => {
  it("succeeds when the mean of the selected courses meets the minimum", () => {
    const result = evaluateAverage(rule, [
      course({ courseCode: "ENG12", gradePercent: 92 }),
      course({ courseCode: "PREC12", gradePercent: 84 }),
      course({ courseCode: "CHEM12", gradePercent: 91 }),
      course({ courseCode: "BIOL12", gradePercent: 94 }),
    ]);
    expect(result.status).toBe("met");
    expect(result.studentValue).toBeCloseTo(90.25, 1);
  });

  it("fails when the mean falls below the minimum", () => {
    const result = evaluateAverage(rule, [
      course({ courseCode: "ENG12", gradePercent: 80 }),
      course({ courseCode: "PREC12", gradePercent: 78 }),
      course({ courseCode: "CHEM12", gradePercent: 75 }),
      course({ courseCode: "BIOL12", gradePercent: 82 }),
    ]);
    expect(result.status).toBe("below_minimum");
  });

  it("is missing_course when one of the selected courses isn't in the plan at all", () => {
    const result = evaluateAverage(rule, [
      course({ courseCode: "ENG12", gradePercent: 92 }),
      course({ courseCode: "PREC12", gradePercent: 84 }),
      course({ courseCode: "CHEM12", gradePercent: 91 }),
    ]);
    expect(result.status).toBe("missing_course");
  });

  it("is unknown_grade when a course is present but has no grade or prediction", () => {
    const result = evaluateAverage(rule, [
      course({ courseCode: "ENG12", gradePercent: 92 }),
      course({ courseCode: "PREC12", gradePercent: 84 }),
      course({ courseCode: "CHEM12", gradePercent: 91 }),
      course({ courseCode: "BIOL12", status: "in_progress", gradePercent: null, predictedGradePercent: null }),
    ]);
    expect(result.status).toBe("unknown_grade");
  });
});
