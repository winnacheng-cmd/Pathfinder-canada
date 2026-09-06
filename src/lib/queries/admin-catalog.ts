import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminAuditLog,
  Course,
  Feedback,
  Institution,
  Program,
  ProgramRequirement,
  SourceSnapshot,
} from "@/types/database";

export async function getAllInstitutions(): Promise<Institution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("institutions").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export type ProgramWithInstitutionName = Program & { institutionName: string };

export async function getAllProgramsForAdmin(): Promise<ProgramWithInstitutionName[]> {
  const supabase = await createClient();
  const [{ data: programs, error: pErr }, { data: institutions, error: iErr }] = await Promise.all([
    supabase.from("programs").select("*").order("name"),
    supabase.from("institutions").select("id, name"),
  ]);
  if (pErr) throw pErr;
  if (iErr) throw iErr;
  const nameById = new Map((institutions ?? []).map((i) => [i.id, i.name]));
  return (programs ?? []).map((p) => ({ ...p, institutionName: nameById.get(p.institution_id) ?? "—" }));
}

export async function getAllCoursesForAdmin(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("province")
    .order("grade_level", { ascending: false })
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getAllSources(): Promise<SourceSnapshot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("source_snapshots")
    .select("*")
    .order("verified_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type RequirementWithContext = ProgramRequirement & {
  programName: string;
  sourceTitle: string | null;
};

export async function getAllRequirementsForAdmin(): Promise<RequirementWithContext[]> {
  const supabase = await createClient();
  const [{ data: requirements, error: rErr }, { data: programs, error: pErr }, { data: sources, error: sErr }] =
    await Promise.all([
      supabase.from("program_requirements").select("*").order("created_at", { ascending: false }),
      supabase.from("programs").select("id, name"),
      supabase.from("source_snapshots").select("id, page_title"),
    ]);
  if (rErr) throw rErr;
  if (pErr) throw pErr;
  if (sErr) throw sErr;

  const programNameById = new Map((programs ?? []).map((p) => [p.id, p.name]));
  const sourceTitleById = new Map((sources ?? []).map((s) => [s.id, s.page_title]));

  return (requirements ?? []).map((r) => ({
    ...r,
    programName: programNameById.get(r.program_id) ?? "—",
    sourceTitle: r.source_snapshot_id ? (sourceTitleById.get(r.source_snapshot_id) ?? "—") : null,
  }));
}

/** Requirements approaching or past their source's expiration, and any lacking a source at all. */
export async function getVerificationQueue() {
  const requirements = await getAllRequirementsForAdmin();
  const sources = await getAllSources();
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const stale = requirements.filter((r) => r.status === "stale");
  const needsReview = requirements.filter((r) => r.status === "needs_review");
  const noSource = requirements.filter((r) => !r.source_snapshot_id);
  const expiringSoon = requirements.filter((r) => {
    if (!r.source_snapshot_id) return false;
    const source = sourceById.get(r.source_snapshot_id);
    if (!source?.expires_at) return false;
    const expiresAt = new Date(source.expires_at);
    return expiresAt <= in30Days && r.status === "verified";
  });

  return { stale, needsReview, noSource, expiringSoon };
}

export async function getAllFeedback(): Promise<(Feedback & { programName: string | null })[]> {
  const supabase = await createClient();
  const [{ data: feedback, error: fErr }, { data: programs, error: pErr }] = await Promise.all([
    supabase.from("feedback").select("*").order("created_at", { ascending: false }),
    supabase.from("programs").select("id, name"),
  ]);
  if (fErr) throw fErr;
  if (pErr) throw pErr;
  const nameById = new Map((programs ?? []).map((p) => [p.id, p.name]));
  return (feedback ?? []).map((f) => ({ ...f, programName: f.program_id ? (nameById.get(f.program_id) ?? null) : null }));
}

export async function getRecentAuditLog(limit = 50): Promise<AdminAuditLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
