"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";

export type SettingsActionState = { error?: string; success?: string } | undefined;

const profileUpdateSchema = z.object({
  gradeLevel: z.enum(["grade_11", "grade_12", "graduated_upgrading"]),
  graduationYear: z.coerce.number().int().min(2020).max(2100),
  interests: z.array(z.string()).max(10),
});

export async function updateProfileAction(input: unknown): Promise<SettingsActionState> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return { error: "Complete onboarding first." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_profiles")
    .update({
      grade_level: parsed.data.gradeLevel,
      graduation_year: parsed.data.graduationYear,
      interests: parsed.data.interests,
    })
    .eq("id", profile.id);
  if (error) return { error: "Couldn't update your profile." };

  return { success: "Saved." };
}

/**
 * Deletes the student's academic data (cascades from student_profiles) and
 * their auth identity. feedback.user_id is set to null by the FK rather
 * than deleted — those data-quality reports may still be actionable. See
 * docs/PRIVACY.md "Deletion".
 *
 * Uses the service-role client for the final auth.users deletion step,
 * since that's the only way to remove an auth identity — never exposed to
 * the browser, only invoked here after re-confirming the caller's own
 * identity via their session.
 */
export async function deleteAccountAction(): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();

    await admin.from("student_profiles").delete().eq("user_id", user.id);

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      if (deleteUserError.message.toLowerCase().includes("foreign key")) {
        return {
          error:
            "This account has admin edit history that can't be removed automatically in the MVP. Contact support to finish deleting it.",
        };
      }
      return { error: "Couldn't delete your account. Please try again." };
    }
  } catch {
    return { error: "Backend not configured — account deletion needs a connected Supabase project." };
  }

  await supabase.auth.signOut();
  redirect("/");
}
