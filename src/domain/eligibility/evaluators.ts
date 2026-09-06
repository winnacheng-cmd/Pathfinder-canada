import type {
  AnyOfRule,
  AtLeastNRule,
  AverageOfSelectedRule,
  GraduationRequirementRule,
  SupplementalRequiredRule,
} from "./rule-schema";
import type { EvaluationCore, StudentCourseInput } from "./types";

function effectiveGrade(course: StudentCourseInput): number | null {
  return course.gradePercent ?? course.predictedGradePercent ?? null;
}

/**
 * Evaluates a single course code against an optional minimum grade.
 * Shared by ANY_OF and AT_LEAST_N since both are, at their core, a set of
 * independent single-course checks. See docs/ADMISSIONS_RULES.md for the
 * exact precedence rules this encodes (planned never gets a grade verdict,
 * in_progress never resolves to "met", etc).
 */
export function evaluateSingleCourse(
  courseCode: string,
  minimumGrade: number | undefined,
  courses: StudentCourseInput[]
): { status: EvaluationCore["status"]; grade: number | null } {
  const record = courses.find((c) => c.courseCode === courseCode);
  if (!record) return { status: "missing_course", grade: null };

  if (record.status === "planned") return { status: "planned", grade: null };

  const grade = effectiveGrade(record);

  if (record.status === "in_progress") {
    if (minimumGrade === undefined) return { status: "in_progress", grade };
    if (grade === null) return { status: "in_progress", grade };
    if (grade < minimumGrade) return { status: "below_minimum", grade };
    return { status: "in_progress", grade };
  }

  // completed
  if (minimumGrade === undefined) return { status: "met", grade };
  if (grade === null) return { status: "unknown_grade", grade };
  if (grade >= minimumGrade) return { status: "met", grade };
  return { status: "below_minimum", grade };
}

const RANK: Record<string, number> = {
  met: 6,
  below_minimum: 5,
  unknown_grade: 4,
  in_progress: 3,
  planned: 2,
  missing_course: 1,
};

export function evaluateAnyOf(rule: AnyOfRule, courses: StudentCourseInput[]): EvaluationCore {
  const candidates = rule.courseCodes.map((code) => ({
    code,
    ...evaluateSingleCourse(code, rule.minimumGrade, courses),
  }));

  const met = candidates.find((c) => c.status === "met");
  if (met) {
    return {
      status: "met",
      studentValue: met.grade,
      requiredValue: rule.minimumGrade ?? null,
      courseCode: met.code,
      matchedCourseCodes: [met.code],
    };
  }

  const best = candidates.reduce((a, b) => (RANK[b.status] > RANK[a.status] ? b : a));
  return {
    status: best.status,
    studentValue: best.grade,
    requiredValue: rule.minimumGrade ?? null,
    courseCode: best.code,
    matchedCourseCodes: [],
  };
}

export function evaluateAtLeastN(rule: AtLeastNRule, courses: StudentCourseInput[]): EvaluationCore {
  const evals = rule.courseCodes.map((code) => ({
    code,
    ...evaluateSingleCourse(code, rule.minimumGrade, courses),
  }));

  const met = evals.filter((e) => e.status === "met");
  if (met.length >= rule.n) {
    return {
      status: "met",
      studentValue: met.length,
      requiredValue: rule.n,
      courseCode: null,
      matchedCourseCodes: met.slice(0, rule.n).map((e) => e.code),
    };
  }

  const metOrBelow = evals.filter((e) => e.status === "met" || e.status === "below_minimum");
  if (metOrBelow.length >= rule.n) {
    return {
      status: "below_minimum",
      studentValue: met.length,
      requiredValue: rule.n,
      courseCode: null,
      matchedCourseCodes: metOrBelow.map((e) => e.code),
    };
  }

  const inPlan = evals.filter((e) => e.status !== "missing_course");
  if (inPlan.length >= rule.n) {
    const anyInProgress = inPlan.some((e) => e.status === "in_progress");
    return {
      status: anyInProgress ? "in_progress" : "planned",
      studentValue: met.length,
      requiredValue: rule.n,
      courseCode: null,
      matchedCourseCodes: inPlan.map((e) => e.code),
    };
  }

  return {
    status: "missing_course",
    studentValue: met.length,
    requiredValue: rule.n,
    courseCode: null,
    matchedCourseCodes: [],
  };
}

export function evaluateAverage(rule: AverageOfSelectedRule, courses: StudentCourseInput[]): EvaluationCore {
  const records = rule.courseCodes.map((code) => courses.find((c) => c.courseCode === code));

  if (records.some((r) => !r)) {
    return {
      status: "missing_course",
      studentValue: null,
      requiredValue: rule.minimum,
      courseCode: null,
      matchedCourseCodes: [],
    };
  }

  const grades = records.map((r) => effectiveGrade(r!));
  const knownGrades = grades.filter((g): g is number => g !== null);
  if (knownGrades.length !== grades.length) {
    return {
      status: "unknown_grade",
      studentValue: null,
      requiredValue: rule.minimum,
      courseCode: null,
      matchedCourseCodes: rule.courseCodes,
    };
  }

  const mean = knownGrades.reduce((sum, g) => sum + g, 0) / knownGrades.length;
  return {
    status: mean >= rule.minimum ? "met" : "below_minimum",
    studentValue: Math.round(mean * 10) / 10,
    requiredValue: rule.minimum,
    courseCode: null,
    matchedCourseCodes: rule.courseCodes,
  };
}

export function evaluateSupplemental(_rule: SupplementalRequiredRule): EvaluationCore {
  return {
    status: "supplemental_required",
    studentValue: null,
    requiredValue: null,
    courseCode: null,
    matchedCourseCodes: [],
  };
}

/**
 * The MVP schema has no field for "on track to graduate" — there's nothing
 * in a student's course list that authoritatively confirms provincial
 * graduation-program completion. Rather than guess, this always reports
 * needs_review: honest about the limit, per "do not hide uncertainty."
 */
export function evaluateGraduationRequirement(_rule: GraduationRequirementRule): EvaluationCore {
  return {
    status: "needs_review",
    studentValue: null,
    requiredValue: null,
    courseCode: null,
    matchedCourseCodes: [],
  };
}
