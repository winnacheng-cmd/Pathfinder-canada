import { describe, expect, it } from "vitest";
import { generateActionPlan } from "@/domain/recommendations/action-engine";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import type { RequirementInput, StudentCourseInput } from "@/domain/eligibility/types";
import type { ProgramEvaluationForActions } from "@/domain/recommendations/types";

function requirement(overrides: Partial<RequirementInput> & { id: string; ruleJson: unknown }): RequirementInput {
  return {
    requirementType: "required_course",
    displayText: overrides.id,
    trustStatus: "verified",
    sourceSnapshotId: "source-1",
    ...overrides,
  };
}

function evalFor(programId: string, programName: string, requirements: RequirementInput[], courses: StudentCourseInput[]): ProgramEvaluationForActions {
  return { programId, programName, evaluation: evaluateProgram(programId, requirements, courses) };
}

describe("generateActionPlan", () => {
  it("creates an add_course action for a missing required course", () => {
    const evaluations = [
      evalFor(
        "p1",
        "Program A",
        [requirement({ id: "chem", ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] } })],
        []
      ),
    ];
    const actions = generateActionPlan(evaluations, []);
    expect(actions).toHaveLength(1);
    expect(actions[0].actionType).toBe("add_course");
    expect(actions[0].courseCode).toBe("CHEM12");
  });

  it("creates an improve_grade action for a below-minimum grade", () => {
    const evaluations = [
      evalFor(
        "p1",
        "Program A",
        [requirement({ id: "precalc", ruleJson: { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 90 } })],
        [{ courseCode: "PREC12", status: "completed", gradePercent: 84 }]
      ),
    ];
    const actions = generateActionPlan(evaluations, []);
    expect(actions).toHaveLength(1);
    expect(actions[0].actionType).toBe("improve_grade");
    expect(actions[0].targetGrade).toBe(90);
    expect(actions[0].explanation).toContain("6-percentage-point");
  });

  it("consolidates the same missing course across multiple programs into one action", () => {
    const req = requirement({ id: "chem", ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] } });
    const evaluations = [
      evalFor("p1", "Program A", [req], []),
      evalFor("p2", "Program B", [{ ...req, id: "chem-2" }], []),
      evalFor("p3", "Program C", [{ ...req, id: "chem-3" }], []),
    ];
    const actions = generateActionPlan(evaluations, []);
    expect(actions).toHaveLength(1);
    expect(actions[0].affectedProgramIds).toEqual(expect.arrayContaining(["p1", "p2", "p3"]));
    expect(actions[0].affectedProgramIds).toHaveLength(3);
  });

  it("ranks an action affecting more programs above one affecting fewer", () => {
    const widelyMissing = requirement({ id: "chem", ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] } });
    const narrowlyMissing = requirement({ id: "phys", ruleJson: { operator: "ANY_OF", courseCodes: ["PHYS12"] } });
    const evaluations = [
      evalFor("p1", "Program A", [widelyMissing, narrowlyMissing], []),
      evalFor("p2", "Program B", [{ ...widelyMissing, id: "chem-2" }], []),
      evalFor("p3", "Program C", [{ ...widelyMissing, id: "chem-3" }], []),
    ];
    const actions = generateActionPlan(evaluations, []);
    expect(actions[0].courseCode).toBe("CHEM12");
    expect(actions[0].affectedProgramIds).toHaveLength(3);
    const physAction = actions.find((a) => a.courseCode === "PHYS12");
    expect(physAction?.affectedProgramIds).toHaveLength(1);
    expect(actions.indexOf(actions[0])).toBeLessThan(actions.indexOf(physAction!));
  });

  it("creates a deadline-bearing action for a pending supplemental requirement", () => {
    const actions = generateActionPlan([], [
      { id: "supp-1", programId: "p1", programName: "Program A", title: "Supplementary application", deadline: "2026-10-15" },
    ]);
    expect(actions).toHaveLength(1);
    expect(actions[0].actionType).toBe("complete_supplemental");
    expect(actions[0].deadline).toBe("2026-10-15");
    expect(actions[0].explanation).toContain("2026-10-15");
  });

  it("uses course names when a lookup is provided", () => {
    const evaluations = [
      evalFor("p1", "Program A", [requirement({ id: "chem", ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] } })], []),
    ];
    const actions = generateActionPlan(evaluations, [], { CHEM12: "Chemistry 12" });
    expect(actions[0].title).toBe("Add Chemistry 12");
  });
});
