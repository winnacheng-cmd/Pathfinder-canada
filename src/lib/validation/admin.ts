import { z } from "zod";

export const institutionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  province: z.string().trim().min(1),
  city: z.string().trim().optional(),
  country: z.string().trim().min(1).default("Canada"),
  official_url: z.string().trim().url(),
  active: z.boolean().default(true),
});

export const programSchema = z.object({
  id: z.string().uuid().optional(),
  institution_id: z.string().uuid(),
  name: z.string().trim().min(1),
  credential: z.string().trim().min(1),
  faculty: z.string().trim().optional(),
  campus: z.string().trim().optional(),
  subject_area: z.enum([
    "Health Sciences",
    "Business",
    "Engineering",
    "Computer Science",
    "Arts",
    "Sciences",
    "Education",
    "Undecided",
  ]),
  intake_year: z.coerce.number().int().min(2020).max(2100),
  application_url: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().optional(),
  active: z.boolean().default(true),
});

export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  province: z.string().trim().min(1),
  curriculum: z.string().trim().min(1),
  code: z.string().trim().min(1).toUpperCase(),
  name: z.string().trim().min(1),
  grade_level: z.enum(["10", "11", "12"]),
  subject_group: z.string().trim().min(1),
  active: z.boolean().default(true),
});

export const sourceSchema = z.object({
  id: z.string().uuid().optional(),
  source_url: z.string().trim().url(),
  official_domain: z.string().trim().min(1),
  page_title: z.string().trim().min(1),
  captured_text_excerpt: z.string().trim().optional(),
  verified_by: z.string().trim().optional(),
  verified_at: z.string().trim().min(1),
  expires_at: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

export const requirementFormSchema = z.object({
  id: z.string().uuid().optional(),
  program_id: z.string().uuid(),
  requirement_type: z.enum([
    "required_course",
    "course_minimum",
    "overall_average_minimum",
    "choose_n_from_group",
    "graduation_requirement",
    "supplemental",
    "language",
    "notes",
  ]),
  operator: z.enum([
    "ANY_OF",
    "AT_LEAST_N",
    "AVERAGE_OF_SELECTED",
    "SUPPLEMENTAL_REQUIRED",
    "GRADUATION_REQUIREMENT",
  ]),
  courseCodes: z.string().trim().optional(),
  minimumGrade: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  n: z.coerce.number().int().min(1).optional().or(z.literal("")),
  minimum: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  supplementalType: z
    .enum(["personal_profile", "supplementary_application", "interview", "portfolio", "audition"])
    .optional(),
  graduationDescription: z.string().trim().optional(),
  display_text: z.string().trim().min(1),
  source_snapshot_id: z.string().uuid().optional().or(z.literal("")),
  effective_cycle: z.string().trim().min(1),
  status: z.enum(["verified", "needs_review", "stale"]),
});

export const feedbackStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]),
});
