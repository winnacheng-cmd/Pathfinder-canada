"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";

const saveScenarioSchema = z.object({
  name: z.string().trim().min(1, "Give this scenario a name.").max(120),
  scenarioJson: z.object({
    courses: z.array(
      z.object({
        courseCode: z.string(),
        status: z.enum(["completed", "in_progress", "planned"]),
        gradePercent: z.number().min(0).max(100).nullable(),
        predictedGradePercent: z.number().min(0).max(100).nullable(),
      })
    ),
  }),
});

export type SaveScenarioState = { error?: string; success?: string } | undefined;

export async function saveScenarioAction(input: unknown): Promise<SaveScenarioState> {
  const parsed = saveScenarioSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid scenario." };

  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return { error: "Complete onboarding first." };

  const supabase = await createClient();
  const { error } = await supabase.from("scenarios").insert({
    student_profile_id: profile.id,
    name: parsed.data.name,
    scenario_json: parsed.data.scenarioJson,
  });
  if (error) return { error: "Couldn't save this scenario." };

  revalidatePath("/simulator");
  return { success: "Scenario saved." };
}
