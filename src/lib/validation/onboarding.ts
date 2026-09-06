import { z } from "zod";
import { subjectAreas } from "@/config/site";

export const studentCourseEntrySchema = z
  .object({
    courseId: z.string().uuid(),
    status: z.enum(["completed", "in_progress", "planned"]),
    gradePercent: z.number().min(0).max(100).nullable(),
    predictedGradePercent: z.number().min(0).max(100).nullable(),
  })
  .refine((c) => c.status !== "planned" || c.gradePercent === null, {
    message: "A planned course can't have a completed grade yet.",
    path: ["gradePercent"],
  });

export const onboardingSchema = z.object({
  province: z.string().min(1),
  curriculum: z.string().min(1),
  gradeLevel: z.enum(["grade_11", "grade_12", "graduated_upgrading"]),
  graduationYear: z.number().int().min(2020).max(2100),
  interests: z.array(z.enum(subjectAreas)).max(subjectAreas.length),
  courses: z.array(studentCourseEntrySchema).max(60),
  savedProgramIds: z.array(z.string().uuid()).max(50),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type StudentCourseEntry = z.infer<typeof studentCourseEntrySchema>;
