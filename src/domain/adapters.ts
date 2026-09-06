/**
 * Bridges DB-row shapes (snake_case, as returned by Supabase or held in
 * src/lib/seed-data.ts) into the domain layer's input shapes. This is the
 * ONE place that translation happens, so /demo (fed seed-data.ts directly)
 * and every live Supabase-backed page run the exact same domain code path.
 */
import type { Course, ProgramRequirement, StudentCourse } from "@/types/database";
import type { RequirementInput, StudentCourseInput } from "./eligibility/types";

export function toStudentCourseInputs(
  studentCourses: StudentCourse[],
  courses: Course[]
): StudentCourseInput[] {
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const result: StudentCourseInput[] = [];
  for (const sc of studentCourses) {
    const course = courseById.get(sc.course_id);
    if (!course) continue;
    result.push({
      courseCode: course.code,
      status: sc.status,
      gradePercent: sc.grade_percent,
      predictedGradePercent: sc.predicted_grade_percent,
    });
  }
  return result;
}

export function toRequirementInputs(requirements: ProgramRequirement[]): RequirementInput[] {
  return requirements.map((r) => ({
    id: r.id,
    requirementType: r.requirement_type,
    ruleJson: r.rule_json,
    displayText: r.display_text,
    trustStatus: r.status,
    sourceSnapshotId: r.source_snapshot_id,
  }));
}
