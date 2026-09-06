import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StudentProfile } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Scoped to the given user_id — never call with anything but the caller's own id. */
export async function getStudentProfileForUser(userId: string): Promise<StudentProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCurrentUserAndProfile() {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  const profile = await getStudentProfileForUser(user.id);
  return { user, profile };
}

/** Reads the caller's own role — used only to decide whether to show the Admin nav link. */
export async function getMyRole(): Promise<"student" | "admin" | "reviewer" | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role ?? null;
}
