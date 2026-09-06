"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { studentCourseEntrySchema } from "@/lib/validation/onboarding";

export type CourseActionState = { error?: string } | undefined;

function revalidateEverythingCoursesAffect() {
  revalidatePath("/courses");
  revalidatePath("/dashboard");
  revalidatePath("/programs");
  revalidatePath("/targets");
  revalidatePath("/simulator");
  revalidatePath("/action-plan");
}

export async function addStudentCourseAction(input: unknown): Promise<CourseActionState> {
  const parsed = studentCourseEntrySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid course." };

  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return { error: "Complete onboarding first." };

  const supabase = await createClient();
  const { error } = await supabase.from("student_courses").insert({
    student_profile_id: profile.id,
    course_id: parsed.data.courseId,
    status: parsed.data.status,
    grade_percent: parsed.data.gradePercent,
    predicted_grade_percent: parsed.data.predictedGradePercent,
  });
  if (error) {
    if (error.code === "23505") return { error: "That course is already on your list." };
    return { error: "Couldn't add that course." };
  }

  revalidateEverythingCoursesAffect();
  return undefined;
}

export async function updateStudentCourseAction(
  studentCourseId: string,
  patch: { status: string; gradePercent: number | null; predictedGradePercent: number | null }
): Promise<CourseActionState> {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return { error: "Complete onboarding first." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_courses")
    .update({
      status: patch.status,
      grade_percent: patch.gradePercent,
      predicted_grade_percent: patch.predictedGradePercent,
    })
    .eq("id", studentCourseId)
    .eq("student_profile_id", profile.id);
  if (error) return { error: "Couldn't update that course." };

  revalidateEverythingCoursesAffect();
  return undefined;
}

export async function removeStudentCourseAction(studentCourseId: string): Promise<CourseActionState> {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return { error: "Complete onboarding first." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_courses")
    .delete()
    .eq("id", studentCourseId)
    .eq("student_profile_id", profile.id);
  if (error) return { error: "Couldn't remove that course." };

  revalidateEverythingCoursesAffect();
  return undefined;
}
