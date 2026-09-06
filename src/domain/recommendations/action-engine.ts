import type {
  ActionPriority,
  ActionRecommendation,
  ProgramEvaluationForActions,
  SupplementalForActions,
} from "./types";

function describeCount(n: number): string {
  return n === 1 ? "1 of your target programs" : `${n} of your target programs`;
}

function priorityForCount(affectedCount: number, hasDeadline = false): ActionPriority {
  if (affectedCount >= 3) return "high";
  if (affectedCount === 2) return "medium";
  return hasDeadline ? "medium" : "low";
}

const PRIORITY_RANK: Record<ActionPriority, number> = { high: 3, medium: 2, low: 1 };

/**
 * Turns evaluated saved programs + their supplemental checklist items into a
 * ranked action plan. Pure and deterministic — no AI involved (see
 * docs/ADMISSIONS_RULES.md). Ranking rule: an action affecting more saved
 * programs always ranks at or above one affecting fewer, regardless of
 * category — see docs/TESTING.md recommendation tests.
 */
export function generateActionPlan(
  evaluations: ProgramEvaluationForActions[],
  supplementalRequirements: SupplementalForActions[],
  courseNameByCode: Record<string, string> = {}
): ActionRecommendation[] {
  const courseLabel = (code: string) => courseNameByCode[code] ?? code;
  const actions: ActionRecommendation[] = [];

  // --- Missing courses: consolidate by course code across all programs ---
  const missingByCourse = new Map<string, { programIds: Set<string>; programNames: Set<string> }>();
  for (const { programId, programName, evaluation } of evaluations) {
    for (const req of evaluation.requirements) {
      if (req.status === "missing_course" && req.courseCode) {
        const entry = missingByCourse.get(req.courseCode) ?? {
          programIds: new Set<string>(),
          programNames: new Set<string>(),
        };
        entry.programIds.add(programId);
        entry.programNames.add(programName);
        missingByCourse.set(req.courseCode, entry);
      }
    }
  }
  for (const [courseCode, { programIds, programNames }] of missingByCourse) {
    const names = Array.from(programNames);
    actions.push({
      id: `add_course:${courseCode}`,
      actionType: "add_course",
      title: `Add ${courseLabel(courseCode)}`,
      explanation: `${courseLabel(courseCode)} is required by ${describeCount(programIds.size)} (${names.join(", ")}).`,
      priority: priorityForCount(programIds.size),
      affectedProgramIds: Array.from(programIds),
      affectedProgramNames: names,
      courseCode,
    });
  }

  // --- Below-minimum grades: consolidate by course code, target the highest published minimum ---
  const belowByCourse = new Map<
    string,
    { programIds: Set<string>; programNames: Set<string>; maxRequired: number; studentValue: number | null }
  >();
  for (const { programId, programName, evaluation } of evaluations) {
    for (const req of evaluation.requirements) {
      if (req.status === "below_minimum" && req.courseCode && req.requiredValue !== null) {
        const entry = belowByCourse.get(req.courseCode) ?? {
          programIds: new Set<string>(),
          programNames: new Set<string>(),
          maxRequired: 0,
          studentValue: req.studentValue,
        };
        entry.programIds.add(programId);
        entry.programNames.add(programName);
        entry.maxRequired = Math.max(entry.maxRequired, req.requiredValue);
        belowByCourse.set(req.courseCode, entry);
      }
    }
  }
  for (const [courseCode, info] of belowByCourse) {
    const names = Array.from(info.programNames);
    const gap = info.studentValue !== null ? info.maxRequired - info.studentValue : null;
    const gapText =
      gap !== null
        ? `A ${gap}-percentage-point increase would satisfy`
        : "Raising this grade would satisfy";
    actions.push({
      id: `improve_grade:${courseCode}:${info.maxRequired}`,
      actionType: "improve_grade",
      title: `Increase ${courseLabel(courseCode)} to at least ${info.maxRequired}% if feasible`,
      explanation: `${gapText} the published minimum for ${describeCount(info.programIds.size)} (${names.join(", ")}). Check with your school/counsellor whether upgrading or retaking is available.`,
      priority: priorityForCount(info.programIds.size),
      affectedProgramIds: Array.from(info.programIds),
      affectedProgramNames: names,
      courseCode,
      targetGrade: info.maxRequired,
    });
  }

  // --- Supplemental checklist items: one action per item (each has its own deadline/program) ---
  for (const supp of supplementalRequirements) {
    actions.push({
      id: `complete_supplemental:${supp.id}`,
      actionType: "complete_supplemental",
      title: `Complete ${supp.title.toLowerCase()}`,
      explanation: `Required for ${supp.programName}.${supp.deadline ? ` Deadline: ${supp.deadline}.` : ""}`,
      priority: priorityForCount(1, Boolean(supp.deadline)),
      affectedProgramIds: [supp.programId],
      affectedProgramNames: [supp.programName],
      deadline: supp.deadline,
    });
  }

  // --- Programs whose eligibility can't be confidently stated due to an unverified requirement ---
  for (const { programId, programName, evaluation } of evaluations) {
    if (evaluation.status === "needs_review") {
      actions.push({
        id: `review_needed:${programId}`,
        actionType: "review_needed",
        title: `Double-check ${programName}'s requirements`,
        explanation:
          "At least one requirement for this program needs re-verification before its eligibility status can be trusted.",
        priority: "low",
        affectedProgramIds: [programId],
        affectedProgramNames: [programName],
      });
    }
  }

  actions.sort((a, b) => {
    if (b.affectedProgramIds.length !== a.affectedProgramIds.length) {
      return b.affectedProgramIds.length - a.affectedProgramIds.length;
    }
    return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
  });

  return actions;
}
