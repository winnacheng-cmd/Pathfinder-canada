import type { ProgramEvaluationStatus } from "@/domain/eligibility/types";

export type ScenarioProgramDiff = "newly_opened" | "lost" | "still_missing" | "unchanged";

// "Open" means the academic bar is cleared — eligible or conditionally
// eligible (met except a pending non-academic supplemental/graduation item).
// The simulator only changes grades/courses, which can never satisfy or
// break a supplemental requirement, so conditionally_eligible is the
// ceiling a grade change can reach and should read as a real win here, not
// get buried under "still unavailable". Dashboard/targets counts keep
// eligible and conditionally_eligible broken out separately since knowing
// about a pending supplemental still matters there.
const isOpen = (status: ProgramEvaluationStatus) =>
  status === "eligible" || status === "conditionally_eligible";

export function classifyScenarioChange(
  before: ProgramEvaluationStatus,
  after: ProgramEvaluationStatus
): ScenarioProgramDiff {
  if (!isOpen(before) && isOpen(after)) return "newly_opened";
  if (isOpen(before) && !isOpen(after)) return "lost";
  if (!isOpen(before) && !isOpen(after)) return "still_missing";
  return "unchanged";
}

export interface ScenarioProgramSnapshot {
  programId: string;
  programName: string;
  status: ProgramEvaluationStatus;
}

export interface ScenarioProgramResult extends ScenarioProgramSnapshot {
  before: ProgramEvaluationStatus;
  after: ProgramEvaluationStatus;
  diff: ScenarioProgramDiff;
}

export interface ScenarioComparison {
  before: { eligible: number; total: number };
  after: { eligible: number; total: number };
  programs: ScenarioProgramResult[];
}

/**
 * Diffs two evaluation snapshots of the same saved programs (before/after a
 * hypothetical grade/course change) into newly-opened / lost / still-missing
 * / unchanged buckets. Pure — no I/O, no React. See docs/PRODUCT.md's
 * what-if simulator description and docs/TESTING.md scenario tests.
 */
export function compareScenario(
  before: ScenarioProgramSnapshot[],
  after: ScenarioProgramSnapshot[]
): ScenarioComparison {
  const afterByProgram = new Map(after.map((p) => [p.programId, p]));

  const programs: ScenarioProgramResult[] = before.map((beforeSnapshot) => {
    const afterSnapshot = afterByProgram.get(beforeSnapshot.programId) ?? beforeSnapshot;
    return {
      programId: beforeSnapshot.programId,
      programName: beforeSnapshot.programName,
      status: afterSnapshot.status,
      before: beforeSnapshot.status,
      after: afterSnapshot.status,
      diff: classifyScenarioChange(beforeSnapshot.status, afterSnapshot.status),
    };
  });

  return {
    before: {
      eligible: before.filter((p) => isOpen(p.status)).length,
      total: before.length,
    },
    after: {
      eligible: after.filter((p) => isOpen(p.status)).length,
      total: after.length,
    },
    programs,
  };
}
