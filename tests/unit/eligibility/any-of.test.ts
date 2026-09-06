import { describe, expect, it } from "vitest";
import { evaluateAnyOf } from "@/domain/eligibility/evaluators";
import type { StudentCourseInput } from "@/domain/eligibility/types";

function course(overrides: Partial<StudentCourseInput> & { courseCode: string }): StudentCourseInput {
  return { status: "completed", ...overrides };
}

describe("evaluateAnyOf — required course", () => {
  it("is met when the course is completed with no minimum grade", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["ENG12"] },
      [course({ courseCode: "ENG12", status: "completed" })]
    );
    expect(result.status).toBe("met");
  });

  it("is missing_course when the student has no record of it", () => {
    const result = evaluateAnyOf({ operator: "ANY_OF", courseCodes: ["CHEM12"] }, []);
    expect(result.status).toBe("missing_course");
  });

  it("is planned when the course is only planned", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["PHYS12"] },
      [course({ courseCode: "PHYS12", status: "planned" })]
    );
    expect(result.status).toBe("planned");
  });

  it("is in_progress when the course is in progress with no grade yet", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["BIOL12"] },
      [course({ courseCode: "BIOL12", status: "in_progress" })]
    );
    expect(result.status).toBe("in_progress");
  });

  it("is met when the grade is above the minimum", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 80 },
      [course({ courseCode: "CHEM12", status: "completed", gradePercent: 91 })]
    );
    expect(result.status).toBe("met");
    expect(result.studentValue).toBe(91);
  });

  it("is met when the grade exactly equals the minimum", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 80 },
      [course({ courseCode: "PREC12", status: "completed", gradePercent: 80 })]
    );
    expect(result.status).toBe("met");
  });

  it("is below_minimum when the grade is under the minimum", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 90 },
      [course({ courseCode: "PREC12", status: "completed", gradePercent: 84 })]
    );
    expect(result.status).toBe("below_minimum");
    expect(result.studentValue).toBe(84);
    expect(result.requiredValue).toBe(90);
  });

  it("is unknown_grade when completed but the grade was skipped", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 80 },
      [course({ courseCode: "CHEM12", status: "completed", gradePercent: null })]
    );
    expect(result.status).toBe("unknown_grade");
  });

  it("succeeds when at least one accepted alternate meets the minimum", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["PREC12", "CALC12"], minimumGrade: 80 },
      [
        course({ courseCode: "PREC12", status: "completed", gradePercent: 60 }),
        course({ courseCode: "CALC12", status: "completed", gradePercent: 88 }),
      ]
    );
    expect(result.status).toBe("met");
    expect(result.courseCode).toBe("CALC12");
    expect(result.matchedCourseCodes).toEqual(["CALC12"]);
  });

  it("fails when none of the alternates are present at all", () => {
    const result = evaluateAnyOf(
      { operator: "ANY_OF", courseCodes: ["PREC12", "CALC12"], minimumGrade: 80 },
      []
    );
    expect(result.status).toBe("missing_course");
  });
});
