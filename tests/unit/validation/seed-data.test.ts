import { describe, expect, it } from "vitest";
import { parseRuleJson } from "@/domain/eligibility/rule-schema";
import {
  courses,
  institutions,
  programRequirements,
  programs,
  sourceSnapshots,
  supplementalRequirements,
} from "@/lib/seed-data";

describe("seed data integrity", () => {
  it("has enough fixtures to demonstrate every feature (build-prompt §27)", () => {
    expect(institutions.length).toBeGreaterThanOrEqual(3);
    expect(programs.length).toBeGreaterThanOrEqual(12);
    expect(courses.length).toBeGreaterThanOrEqual(20);
  });

  it("covers all six MVP subject areas", () => {
    const areas = new Set(programs.map((p) => p.subject_area));
    for (const area of ["Health Sciences", "Business", "Engineering", "Computer Science", "Arts", "Sciences"]) {
      expect(areas.has(area as never)).toBe(true);
    }
  });

  it("every program_requirements.rule_json passes the Zod schema", () => {
    for (const requirement of programRequirements) {
      const result = parseRuleJson(requirement.rule_json);
      expect(result.success, `${requirement.id}: ${!result.success && result.error.message}`).toBe(true);
    }
  });

  it("every requirement references a program that exists", () => {
    const programIds = new Set(programs.map((p) => p.id));
    for (const requirement of programRequirements) {
      expect(programIds.has(requirement.program_id)).toBe(true);
    }
  });

  it("every program references an institution that exists", () => {
    const institutionIds = new Set(institutions.map((i) => i.id));
    for (const program of programs) {
      expect(institutionIds.has(program.institution_id)).toBe(true);
    }
  });

  it("a verified requirement always has a source_snapshot_id", () => {
    for (const requirement of programRequirements) {
      if (requirement.status === "verified") {
        expect(requirement.source_snapshot_id).not.toBeNull();
      }
    }
  });

  it("every non-null source_snapshot_id on a requirement resolves to a real source", () => {
    const sourceIds = new Set(sourceSnapshots.map((s) => s.id));
    for (const requirement of programRequirements) {
      if (requirement.source_snapshot_id) {
        expect(sourceIds.has(requirement.source_snapshot_id)).toBe(true);
      }
    }
  });

  it("includes at least one stale and one needs_review requirement (trust-badge coverage)", () => {
    const statuses = new Set(programRequirements.map((r) => r.status));
    expect(statuses.has("stale")).toBe(true);
    expect(statuses.has("needs_review")).toBe(true);
  });

  it("includes at least one requirement with no source at all (verification-queue coverage)", () => {
    expect(programRequirements.some((r) => r.source_snapshot_id === null)).toBe(true);
  });

  it("every supplemental requirement references a program that exists", () => {
    const programIds = new Set(programs.map((p) => p.id));
    for (const supplemental of supplementalRequirements) {
      expect(programIds.has(supplemental.program_id)).toBe(true);
    }
  });

  it("has no duplicate course codes", () => {
    const codes = courses.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
