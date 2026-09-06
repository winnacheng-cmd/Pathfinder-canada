import { describe, expect, it } from "vitest";
import { describeRule, parseRuleJson } from "@/domain/eligibility/rule-schema";

describe("parseRuleJson", () => {
  it("accepts a valid ANY_OF rule", () => {
    const result = parseRuleJson({ operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 90 });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown operator", () => {
    const result = parseRuleJson({ operator: "MAGIC", courseCodes: ["CHEM12"] });
    expect(result.success).toBe(false);
  });

  it("rejects malformed JSON shape (missing required fields)", () => {
    const result = parseRuleJson({ operator: "ANY_OF" });
    expect(result.success).toBe(false);
  });

  it("rejects an out-of-range minimumGrade", () => {
    const result = parseRuleJson({ operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 150 });
    expect(result.success).toBe(false);
  });

  it("rejects AT_LEAST_N when n exceeds the course list length", () => {
    const result = parseRuleJson({ operator: "AT_LEAST_N", n: 5, courseCodes: ["CHEM12", "PHYS12"] });
    expect(result.success).toBe(false);
  });

  it("rejects a non-object payload entirely", () => {
    const result = parseRuleJson("just a string");
    expect(result.success).toBe(false);
  });
});

describe("describeRule", () => {
  it("produces a plain-English preview for ANY_OF", () => {
    const text = describeRule({ operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 90 });
    expect(text).toContain("CHEM12");
    expect(text).toContain("90");
  });

  it("produces a plain-English preview for AT_LEAST_N", () => {
    const text = describeRule({
      operator: "AT_LEAST_N",
      n: 2,
      courseCodes: ["CHEM12", "PHYS12", "BIOL12"],
    });
    expect(text).toContain("at least 2");
  });
});
