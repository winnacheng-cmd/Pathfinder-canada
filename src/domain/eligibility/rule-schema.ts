import { z } from "zod";

// Rule JSON operators — see docs/ADMISSIONS_RULES.md and docs/DATA_MODEL.md.
// This is the ONLY place rule shapes are defined; the evaluator and every
// admin form must go through parseRuleJson() rather than trusting raw JSON.

export const supplementalTypeSchema = z.enum([
  "personal_profile",
  "supplementary_application",
  "interview",
  "portfolio",
  "audition",
]);

export const anyOfRuleSchema = z.object({
  operator: z.literal("ANY_OF"),
  courseCodes: z.array(z.string().min(1)).min(1),
  minimumGrade: z.number().min(0).max(100).optional(),
});

export const atLeastNRuleSchema = z
  .object({
    operator: z.literal("AT_LEAST_N"),
    n: z.number().int().min(1),
    courseCodes: z.array(z.string().min(1)).min(1),
    minimumGrade: z.number().min(0).max(100).optional(),
  })
  .refine((rule) => rule.n <= rule.courseCodes.length, {
    message: "n cannot exceed the number of course codes",
    path: ["n"],
  });

export const averageOfSelectedRuleSchema = z.object({
  operator: z.literal("AVERAGE_OF_SELECTED"),
  courseCodes: z.array(z.string().min(1)).min(2),
  minimum: z.number().min(0).max(100),
});

export const supplementalRequiredRuleSchema = z.object({
  operator: z.literal("SUPPLEMENTAL_REQUIRED"),
  type: supplementalTypeSchema,
});

export const graduationRequirementRuleSchema = z.object({
  operator: z.literal("GRADUATION_REQUIREMENT"),
  description: z.string().optional(),
});

export const ruleJsonSchema = z.discriminatedUnion("operator", [
  anyOfRuleSchema,
  atLeastNRuleSchema,
  averageOfSelectedRuleSchema,
  supplementalRequiredRuleSchema,
  graduationRequirementRuleSchema,
]);

export type RuleJson = z.infer<typeof ruleJsonSchema>;
export type AnyOfRule = z.infer<typeof anyOfRuleSchema>;
export type AtLeastNRule = z.infer<typeof atLeastNRuleSchema>;
export type AverageOfSelectedRule = z.infer<typeof averageOfSelectedRuleSchema>;
export type SupplementalRequiredRule = z.infer<typeof supplementalRequiredRuleSchema>;
export type GraduationRequirementRule = z.infer<typeof graduationRequirementRuleSchema>;
export type SupplementalType = z.infer<typeof supplementalTypeSchema>;

export function parseRuleJson(input: unknown) {
  return ruleJsonSchema.safeParse(input);
}

/**
 * Human-readable preview of a rule, shown in the admin UI before saving so a
 * typo in JSON doesn't silently corrupt eligibility results. See build-prompt
 * §52 and docs/DATA_VERIFICATION.md.
 */
export function describeRule(rule: RuleJson): string {
  switch (rule.operator) {
    case "ANY_OF": {
      const courses = rule.courseCodes.join(" or ");
      return rule.minimumGrade
        ? `Student must have ${courses} with at least ${rule.minimumGrade}%.`
        : `Student must have ${courses}.`;
    }
    case "AT_LEAST_N": {
      const courses = rule.courseCodes.join(", ");
      const gradeNote = rule.minimumGrade ? ` (each at least ${rule.minimumGrade}%)` : "";
      return `Student must have at least ${rule.n} of: ${courses}${gradeNote}.`;
    }
    case "AVERAGE_OF_SELECTED": {
      const courses = rule.courseCodes.join(", ");
      return `The average of ${courses} must be at least ${rule.minimum}%.`;
    }
    case "SUPPLEMENTAL_REQUIRED": {
      const labels: Record<SupplementalType, string> = {
        personal_profile: "a personal profile",
        supplementary_application: "a supplementary application",
        interview: "an interview",
        portfolio: "a portfolio",
        audition: "an audition",
      };
      return `Student must complete ${labels[rule.type]}.`;
    }
    case "GRADUATION_REQUIREMENT":
      return rule.description ?? "Student must complete their provincial graduation requirement.";
  }
}
