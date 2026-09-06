"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { z } from "zod";

export type ProgramActionState = { error?: string; success?: string } | undefined;

export async function toggleSaveProgramAction(programId: string, save: boolean) {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return { error: "Complete onboarding before saving programs." };

  const supabase = await createClient();
  if (save) {
    const { error } = await supabase
      .from("saved_programs")
      .insert({ student_profile_id: profile.id, program_id: programId });
    // Unique-constraint violation just means it's already saved — not an error.
    if (error && error.code !== "23505") return { error: "Couldn't save this program." };
  } else {
    const { error } = await supabase
      .from("saved_programs")
      .delete()
      .eq("student_profile_id", profile.id)
      .eq("program_id", programId);
    if (error) return { error: "Couldn't remove this program." };
  }

  revalidatePath("/programs");
  revalidatePath(`/programs/${programId}`);
  revalidatePath("/targets");
  revalidatePath("/dashboard");
  return { success: save ? "Saved." : "Removed." };
}

const feedbackSchema = z.object({
  programId: z.string().uuid(),
  feedbackType: z.enum(["incorrect_requirement", "stale_source", "confusing", "other"]),
  body: z.string().max(2000).optional(),
});

export async function submitFeedbackAction(
  _prevState: ProgramActionState,
  formData: FormData
): Promise<ProgramActionState> {
  const parsed = feedbackSchema.safeParse({
    programId: formData.get("programId"),
    feedbackType: formData.get("feedbackType"),
    body: formData.get("body") || undefined,
  });
  if (!parsed.success) return { error: "Please choose what's wrong before submitting." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    user_id: user?.id ?? null,
    program_id: parsed.data.programId,
    feedback_type: parsed.data.feedbackType,
    body: parsed.data.body ?? null,
  });
  if (error) return { error: "Couldn't submit your report. Please try again." };

  return { success: "Thanks — an admin will review this." };
}
