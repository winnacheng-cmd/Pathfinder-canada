import { describe, expect, it } from "vitest";
import { toRequirementInputs, toStudentCourseInputs } from "@/domain/adapters";
import { courseIdByCode, courses, programRequirements } from "@/lib/seed-data";
import type { StudentCourse } from "@/types/database";

describe("toStudentCourseInputs", () => {
  it("maps a student_courses row to a domain StudentCourseInput using the course code", () => {
    const studentCourses: StudentCourse[] = [
      {
        id: "sc-1",
        student_profile_id: "profile-1",
        course_id: courseIdByCode.CHEM12,
        status: "completed",
        grade_percent: 91,
        predicted_grade_percent: null,
        created_at: "",
        updated_at: "",
      },
    ];
    const [result] = toStudentCourseInputs(studentCourses, courses);
    expect(result.courseCode).toBe("CHEM12");
    expect(result.gradePercent).toBe(91);
  });

  it("drops a student_courses row whose course_id doesn't resolve (defensive, shouldn't happen with FK)", () => {
    const studentCourses: StudentCourse[] = [
      {
        id: "sc-1",
        student_profile_id: "profile-1",
        course_id: "does-not-exist",
        status: "completed",
        grade_percent: 91,
        predicted_grade_percent: null,
        created_at: "",
        updated_at: "",
      },
    ];
    expect(toStudentCourseInputs(studentCourses, courses)).toHaveLength(0);
  });
});

describe("toRequirementInputs", () => {
  it("maps program_requirements rows to domain RequirementInput preserving trust status", () => {
    const [result] = toRequirementInputs(programRequirements.slice(0, 1));
    expect(result.trustStatus).toBe(programRequirements[0].status);
    expect(result.ruleJson).toBe(programRequirements[0].rule_json);
  });
});
