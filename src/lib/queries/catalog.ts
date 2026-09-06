import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Course, Institution, Program } from "@/types/database";

export async function getCourses(province: string, curriculum: string): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("province", province)
    .eq("curriculum", curriculum)
    .eq("active", true)
    .order("grade_level", { ascending: false })
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export type ProgramWithInstitution = Program & { institution: Institution };

export async function getAllProgramsWithInstitution(): Promise<ProgramWithInstitution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*, institution:institutions(*)")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as ProgramWithInstitution[];
}
