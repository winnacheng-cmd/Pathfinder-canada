/**
 * Precomputes everything /demo needs directly from src/lib/seed-data.ts —
 * zero Supabase, zero auth. This is the same domain engine + adapters every
 * live page uses, just fed static fixtures instead of a DB round trip. See
 * docs/ARCHITECTURE.md "Why Supabase, and how the app behaves without it".
 */
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import { generateActionPlan } from "@/domain/recommendations/action-engine";
import { toRequirementInputs, toStudentCourseInputs } from "@/domain/adapters";
import type { StudentCourseInput } from "@/domain/eligibility/types";
import {
  courses,
  demoSavedProgramSlugs,
  demoStudentCourses,
  institutions,
  programIdBySlug,
  programRequirements,
  programs,
  sourceSnapshots,
} from "@/lib/seed-data";
import type { StudentCourse } from "@/types/database";

const courseNameByCode = Object.fromEntries(courses.map((c) => [c.code, c.name]));
const institutionById = new Map(institutions.map((i) => [i.id, i]));
const sourceById = new Map(sourceSnapshots.map((s) => [s.id, s]));

const demoStudentCourseRows: StudentCourse[] = demoStudentCourses.map((c, i) => ({
  ...c,
  id: `demo-course-${i}`,
  student_profile_id: "demo",
}));

export const demoCourses: StudentCourseInput[] = toStudentCourseInputs(demoStudentCourseRows, courses);

const demoProgramIds = new Set(demoSavedProgramSlugs.map((slug) => programIdBySlug(slug)));
const demoPrograms = programs.filter((p) => demoProgramIds.has(p.id));

const demoEvaluations = demoPrograms.map((program) => {
  const requirements = programRequirements.filter((r) => r.program_id === program.id);
  return {
    programId: program.id,
    programName: program.name,
    evaluation: evaluateProgram(program.id, toRequirementInputs(requirements), demoCourses),
  };
});

export const demoProgramDetails = demoPrograms.map((program) => {
  const { evaluation } = demoEvaluations.find((e) => e.programId === program.id)!;
  return {
    program,
    institution: institutionById.get(program.institution_id)!,
    requirements: evaluation.requirements.map((result) => ({
      result,
      source: result.sourceSnapshotId ? sourceById.get(result.sourceSnapshotId) : undefined,
    })),
    status: evaluation.status,
  };
});

export const demoActions = generateActionPlan(demoEvaluations, [], courseNameByCode);

export const demoCounts = {
  total: demoProgramDetails.length,
  eligible: demoProgramDetails.filter((d) => d.status === "eligible").length,
  missing: demoProgramDetails.filter((d) => d.status === "missing_requirements").length,
  needsReview: demoProgramDetails.filter((d) => d.status === "needs_review").length,
};

export const demoSimulatorPrograms = demoPrograms.map((p) => ({
  programId: p.id,
  programName: p.name,
  requirements: toRequirementInputs(programRequirements.filter((r) => r.program_id === p.id)),
}));

export const demoSimulatorCourses = demoStudentCourses.map((c) => {
  const course = courses.find((course) => course.id === c.course_id)!;
  return {
    courseCode: course.code,
    name: course.name,
    status: c.status,
    gradePercent: c.grade_percent,
    predictedGradePercent: c.predicted_grade_percent,
  };
});

export const demoCourseNameByCode = courseNameByCode;
export const demoAvailableCourses = courses;
