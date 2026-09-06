import "server-only";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import { toRequirementInputs } from "@/domain/adapters";
import { generateActionPlan } from "@/domain/recommendations/action-engine";
import type { ProgramEvaluationForActions } from "@/domain/recommendations/types";
import {
  getRecentlyVerifiedSources,
  getSavedProgramsWithDetails,
  getSupplementalRequirementsForPrograms,
} from "./programs";
import { getStudentCourseInputs } from "./student-courses";
import { getCourses } from "./catalog";
import type { StudentProfile } from "@/types/database";

/**
 * One composed read for everything the Dashboard, Action Plan, and
 * Application Plan pages need — evaluations for every saved program, the
 * ranked action plan, status counts, and recently-verified sources for the
 * trust section. Kept in one place so those pages can't drift out of sync.
 */
export async function getActionPlanData(profile: StudentProfile) {
  const [{ programs, requirementsByProgram }, studentCourses, allCourses] = await Promise.all([
    getSavedProgramsWithDetails(profile.id),
    getStudentCourseInputs(profile.id),
    getCourses(profile.province, profile.curriculum),
  ]);

  const courseNameByCode = Object.fromEntries(allCourses.map((c) => [c.code, c.name]));

  const evaluations: ProgramEvaluationForActions[] = programs.map((program) => ({
    programId: program.id,
    programName: program.name,
    evaluation: evaluateProgram(
      program.id,
      toRequirementInputs(requirementsByProgram[program.id] ?? []),
      studentCourses
    ),
  }));

  const programIds = programs.map((p) => p.id);
  const [supplementalRequirements, recentlyVerifiedSources] = await Promise.all([
    getSupplementalRequirementsForPrograms(programIds),
    getRecentlyVerifiedSources(programIds),
  ]);

  const programNameById = Object.fromEntries(programs.map((p) => [p.id, p.name]));
  const actions = generateActionPlan(
    evaluations,
    supplementalRequirements.map((s) => ({
      id: s.id,
      programId: s.program_id,
      programName: programNameById[s.program_id] ?? "a saved program",
      title: s.title,
      deadline: s.deadline,
    })),
    courseNameByCode
  );

  const counts = {
    total: evaluations.length,
    eligible: evaluations.filter((e) => e.evaluation.status === "eligible").length,
    conditionallyEligible: evaluations.filter((e) => e.evaluation.status === "conditionally_eligible").length,
    missing: evaluations.filter((e) => e.evaluation.status === "missing_requirements").length,
    needsReview: evaluations.filter((e) => e.evaluation.status === "needs_review").length,
  };

  return {
    programs,
    evaluations,
    actions,
    counts,
    supplementalRequirements,
    recentlyVerifiedSources,
  };
}
