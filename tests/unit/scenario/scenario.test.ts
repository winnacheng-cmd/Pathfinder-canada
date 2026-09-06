import { describe, expect, it } from "vitest";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import { compareScenario } from "@/domain/scenario/compare-scenario";
import { removeScenarioCourse, upsertScenarioCourse } from "@/domain/scenario/apply-scenario";
import type { RequirementInput, StudentCourseInput } from "@/domain/eligibility/types";

const precalcRequirement: RequirementInput = {
  id: "precalc",
  requirementType: "required_course",
  ruleJson: { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 90 },
  displayText: "Pre-Calculus 12, minimum 90%",
  trustStatus: "verified",
  sourceSnapshotId: "s1",
};

const chemRequirement: RequirementInput = {
  id: "chem",
  requirementType: "required_course",
  ruleJson: { operator: "ANY_OF", courseCodes: ["CHEM12"] },
  displayText: "Chemistry 12 required",
  trustStatus: "verified",
  sourceSnapshotId: "s2",
};

function snapshotFor(programId: string, programName: string, requirements: RequirementInput[], courses: StudentCourseInput[]) {
  const evaluation = evaluateProgram(programId, requirements, courses);
  return { programId, programName, status: evaluation.status };
}

describe("what-if scenario comparison", () => {
  it("raising a grade opens a program", () => {
    const baseCourses: StudentCourseInput[] = [{ courseCode: "PREC12", status: "completed", gradePercent: 84 }];
    const raisedCourses = upsertScenarioCourse(baseCourses, {
      courseCode: "PREC12",
      status: "completed",
      gradePercent: 90,
    });

    const before = snapshotFor("p1", "Program A", [precalcRequirement], baseCourses);
    const after = snapshotFor("p1", "Program A", [precalcRequirement], raisedCourses);
    const comparison = compareScenario([before], [after]);

    expect(comparison.programs[0].diff).toBe("newly_opened");
    expect(comparison.after.eligible).toBe(1);
  });

  it("lowering a grade removes eligibility", () => {
    const baseCourses: StudentCourseInput[] = [{ courseCode: "PREC12", status: "completed", gradePercent: 95 }];
    const loweredCourses = upsertScenarioCourse(baseCourses, {
      courseCode: "PREC12",
      status: "completed",
      gradePercent: 70,
    });

    const before = snapshotFor("p1", "Program A", [precalcRequirement], baseCourses);
    const after = snapshotFor("p1", "Program A", [precalcRequirement], loweredCourses);
    const comparison = compareScenario([before], [after]);

    expect(comparison.programs[0].diff).toBe("lost");
  });

  it("adding a course opens a program", () => {
    const baseCourses: StudentCourseInput[] = [];
    const withCourse = upsertScenarioCourse(baseCourses, { courseCode: "CHEM12", status: "completed" });

    const before = snapshotFor("p2", "Program B", [chemRequirement], baseCourses);
    const after = snapshotFor("p2", "Program B", [chemRequirement], withCourse);
    const comparison = compareScenario([before], [after]);

    expect(comparison.programs[0].diff).toBe("newly_opened");
  });

  it("removing a course closes a program", () => {
    const baseCourses: StudentCourseInput[] = [{ courseCode: "CHEM12", status: "completed" }];
    const withoutCourse = removeScenarioCourse(baseCourses, "CHEM12");

    const before = snapshotFor("p2", "Program B", [chemRequirement], baseCourses);
    const after = snapshotFor("p2", "Program B", [chemRequirement], withoutCourse);
    const comparison = compareScenario([before], [after]);

    expect(comparison.programs[0].diff).toBe("lost");
  });

  it("treats reaching conditionally_eligible as newly_opened — a grade change can never satisfy a pending supplemental", () => {
    const supplementalRequirement: RequirementInput = {
      id: "supp",
      requirementType: "supplemental",
      ruleJson: { operator: "SUPPLEMENTAL_REQUIRED", type: "personal_profile" },
      displayText: "Personal profile required",
      trustStatus: "verified",
      sourceSnapshotId: "s3",
    };
    const baseCourses: StudentCourseInput[] = [{ courseCode: "PREC12", status: "completed", gradePercent: 84 }];
    const raisedCourses = upsertScenarioCourse(baseCourses, {
      courseCode: "PREC12",
      status: "completed",
      gradePercent: 90,
    });

    const before = snapshotFor("p3", "Program C", [precalcRequirement, supplementalRequirement], baseCourses);
    const after = snapshotFor("p3", "Program C", [precalcRequirement, supplementalRequirement], raisedCourses);

    expect(before.status).toBe("missing_requirements");
    expect(after.status).toBe("conditionally_eligible");

    const comparison = compareScenario([before], [after]);
    expect(comparison.programs[0].diff).toBe("newly_opened");
  });

  it("an unchanged scenario reports unchanged for every program", () => {
    const courses: StudentCourseInput[] = [{ courseCode: "CHEM12", status: "completed" }];
    const before = snapshotFor("p2", "Program B", [chemRequirement], courses);
    const after = snapshotFor("p2", "Program B", [chemRequirement], courses);
    const comparison = compareScenario([before], [after]);

    expect(comparison.programs[0].diff).toBe("unchanged");
    expect(comparison.before.eligible).toBe(comparison.after.eligible);
  });
});
