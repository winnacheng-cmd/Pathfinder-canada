import type { StudentCourseInput } from "@/domain/eligibility/types";

/** Clones the course list and upserts one course (add, or change grade/status/prediction). */
export function upsertScenarioCourse(
  courses: StudentCourseInput[],
  change: StudentCourseInput
): StudentCourseInput[] {
  const existingIndex = courses.findIndex((c) => c.courseCode === change.courseCode);
  if (existingIndex === -1) return [...courses, change];
  const next = [...courses];
  next[existingIndex] = { ...next[existingIndex], ...change };
  return next;
}

/** Clones the course list with one course removed. */
export function removeScenarioCourse(courses: StudentCourseInput[], courseCode: string): StudentCourseInput[] {
  return courses.filter((c) => c.courseCode !== courseCode);
}
