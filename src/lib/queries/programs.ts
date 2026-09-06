import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Institution,
  Program,
  ProgramRequirement,
  SourceSnapshot,
  SubjectArea,
  SupplementalRequirement,
} from "@/types/database";

export type ProgramWithInstitution = Program & { institution: Institution };

export async function searchPrograms(filters: {
  query?: string;
  subjectArea?: SubjectArea | "all";
}): Promise<ProgramWithInstitution[]> {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("programs")
    .select("*, institution:institutions(*)")
    .eq("active", true);

  if (filters.subjectArea && filters.subjectArea !== "all") {
    queryBuilder = queryBuilder.eq("subject_area", filters.subjectArea);
  }
  if (filters.query) {
    queryBuilder = queryBuilder.ilike("name", `%${filters.query}%`);
  }

  const { data, error } = await queryBuilder.order("name");
  if (error) throw error;
  let results = (data ?? []) as unknown as ProgramWithInstitution[];

  // Also match on institution name — cheap client-side pass since the
  // catalog is small (see docs/ARCHITECTURE.md "Performance": Postgres
  // search is sufficient for MVP scale, no Elasticsearch).
  if (filters.query && results.length === 0) {
    const { data: byInstitution } = await supabase
      .from("programs")
      .select("*, institution:institutions(*)")
      .eq("active", true)
      .order("name");
    const q = filters.query.toLowerCase();
    results = ((byInstitution ?? []) as unknown as ProgramWithInstitution[]).filter((p) =>
      p.institution.name.toLowerCase().includes(q)
    );
  }

  return results;
}

export interface ProgramDetail {
  program: ProgramWithInstitution;
  requirements: ProgramRequirement[];
  supplementalRequirements: SupplementalRequirement[];
  sourceSnapshotsById: Record<string, SourceSnapshot>;
}

export async function getProgramDetail(programId: string): Promise<ProgramDetail | null> {
  const supabase = await createClient();

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("*, institution:institutions(*)")
    .eq("id", programId)
    .maybeSingle();
  if (programError) throw programError;
  if (!program) return null;

  const [{ data: requirements, error: reqError }, { data: supplemental, error: suppError }] =
    await Promise.all([
      supabase.from("program_requirements").select("*").eq("program_id", programId),
      supabase.from("supplemental_requirements").select("*").eq("program_id", programId),
    ]);
  if (reqError) throw reqError;
  if (suppError) throw suppError;

  const sourceIds = Array.from(
    new Set(
      [...(requirements ?? []).map((r) => r.source_snapshot_id), ...(supplemental ?? []).map((s) => s.source_snapshot_id)].filter(
        (id): id is string => Boolean(id)
      )
    )
  );

  const sourceSnapshotsById: Record<string, SourceSnapshot> = {};
  if (sourceIds.length > 0) {
    const { data: sources, error: sourceError } = await supabase
      .from("source_snapshots")
      .select("*")
      .in("id", sourceIds);
    if (sourceError) throw sourceError;
    for (const source of sources ?? []) sourceSnapshotsById[source.id] = source;
  }

  return {
    program: program as unknown as ProgramWithInstitution,
    requirements: requirements ?? [],
    supplementalRequirements: supplemental ?? [],
    sourceSnapshotsById,
  };
}

export async function getRequirementsForPrograms(
  programIds: string[]
): Promise<Record<string, ProgramRequirement[]>> {
  if (programIds.length === 0) return {};
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("program_requirements")
    .select("*")
    .in("program_id", programIds);
  if (error) throw error;

  const byProgram: Record<string, ProgramRequirement[]> = {};
  for (const requirement of data ?? []) {
    (byProgram[requirement.program_id] ??= []).push(requirement);
  }
  return byProgram;
}

export async function getSavedProgramsWithDetails(studentProfileId: string): Promise<{
  programs: ProgramWithInstitution[];
  requirementsByProgram: Record<string, ProgramRequirement[]>;
}> {
  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from("saved_programs")
    .select("program_id")
    .eq("student_profile_id", studentProfileId);
  if (error) throw error;

  const programIds = (saved ?? []).map((row) => row.program_id);
  if (programIds.length === 0) return { programs: [], requirementsByProgram: {} };

  const { data: programRows, error: programsError } = await supabase
    .from("programs")
    .select("*, institution:institutions(*)")
    .in("id", programIds);
  if (programsError) throw programsError;

  const programs = (programRows ?? []) as unknown as ProgramWithInstitution[];
  const requirementsByProgram = await getRequirementsForPrograms(programIds);
  return { programs, requirementsByProgram };
}

export async function getSupplementalRequirementsForPrograms(
  programIds: string[]
): Promise<SupplementalRequirement[]> {
  if (programIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplemental_requirements")
    .select("*")
    .in("program_id", programIds);
  if (error) throw error;
  return data ?? [];
}

export async function getRecentlyVerifiedSources(
  programIds: string[],
  limit = 3
): Promise<SourceSnapshot[]> {
  if (programIds.length === 0) return [];
  const supabase = await createClient();
  const { data: requirements, error: reqError } = await supabase
    .from("program_requirements")
    .select("source_snapshot_id")
    .in("program_id", programIds)
    .eq("status", "verified");
  if (reqError) throw reqError;

  const sourceIds = Array.from(
    new Set((requirements ?? []).map((r) => r.source_snapshot_id).filter((id): id is string => Boolean(id)))
  );
  if (sourceIds.length === 0) return [];

  const { data: sources, error: sourceError } = await supabase
    .from("source_snapshots")
    .select("*")
    .in("id", sourceIds)
    .order("verified_at", { ascending: false })
    .limit(limit);
  if (sourceError) throw sourceError;
  return sources ?? [];
}

/** Every source referenced by these programs' requirements, regardless of trust status — used by the printable Application Plan, which must not hide stale/unverified sources. */
export async function getAllSourcesForPrograms(programIds: string[]): Promise<SourceSnapshot[]> {
  if (programIds.length === 0) return [];
  const supabase = await createClient();
  const { data: requirements, error: reqError } = await supabase
    .from("program_requirements")
    .select("source_snapshot_id")
    .in("program_id", programIds);
  if (reqError) throw reqError;

  const sourceIds = Array.from(
    new Set((requirements ?? []).map((r) => r.source_snapshot_id).filter((id): id is string => Boolean(id)))
  );
  if (sourceIds.length === 0) return [];

  const { data: sources, error: sourceError } = await supabase
    .from("source_snapshots")
    .select("*")
    .in("id", sourceIds)
    .order("verified_at", { ascending: false });
  if (sourceError) throw sourceError;
  return sources ?? [];
}

export async function getSavedProgramIds(studentProfileId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_programs")
    .select("program_id")
    .eq("student_profile_id", studentProfileId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.program_id));
}
