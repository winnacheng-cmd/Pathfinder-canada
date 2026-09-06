"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/onboarding";

export type OnboardingActionState = { error?: string } | undefined;

export async function completeOnboardingAction(input: unknown): Promise<OnboardingActionState> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your answers and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired — please log in again." };

  const { data: existing } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) redirect("/dashboard");

  const { data: profile, error: profileError } = await supabase
    .from("student_profiles")
    .insert({
      user_id: user.id,
      province: parsed.data.province,
      curriculum: parsed.data.curriculum,
      grade_level: parsed.data.gradeLevel,
      graduation_year: parsed.data.graduationYear,
      interests: parsed.data.interests,
    })
    .select("id")
    .single();

  if (profileError || !profile) {
    return { error: "Could not save your profile. Please try again." };
  }

  if (parsed.data.courses.length > 0) {
    const { error: coursesError } = await supabase.from("student_courses").insert(
      parsed.data.courses.map((c) => ({
        student_profile_id: profile.id,
        course_id: c.courseId,
        status: c.status,
        grade_percent: c.gradePercent,
        predicted_grade_percent: c.predictedGradePercent,
      }))
    );
    if (coursesError) {
      return {
        error: "Saved your profile, but couldn't save your courses — add them from My Courses.",
      };
    }
  }

  if (parsed.data.savedProgramIds.length > 0) {
    await supabase.from("saved_programs").insert(
      parsed.data.savedProgramIds.map((programId) => ({
        student_profile_id: profile.id,
        program_id: programId,
      }))
    );
    // Not fatal if this fails — programs can be saved later from Program Search.
  }

  redirect("/dashboard");
}
