import type { Metadata } from "next";
import { Suspense } from "react";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import { toRequirementInputs } from "@/domain/adapters";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getStudentCourseInputs } from "@/lib/queries/student-courses";
import { getRequirementsForPrograms, getSavedProgramIds, searchPrograms } from "@/lib/queries/programs";
import { ProgramFilterBar } from "@/features/programs/ProgramFilterBar";
import { ProgramCard } from "@/components/ProgramCard";
import { EmptyState } from "@/components/EmptyState";
import { SearchX } from "lucide-react";
import type { SubjectArea } from "@/types/database";

export const metadata: Metadata = { title: "Find Programs" };
export const dynamic = "force-dynamic";

async function ProgramResults({ q, subject }: { q?: string; subject?: string }) {
  const { profile } = await getCurrentUserAndProfile();

  const [programs, savedIds, studentCourses] = await Promise.all([
    searchPrograms({ query: q, subjectArea: (subject as SubjectArea) ?? "all" }),
    profile ? getSavedProgramIds(profile.id) : Promise.resolve(new Set<string>()),
    profile ? getStudentCourseInputs(profile.id) : Promise.resolve([]),
  ]);

  const requirementsByProgram = await getRequirementsForPrograms(programs.map((p) => p.id));

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No programs found"
        description="Try a different search term or clear the subject filter."
      />
    );
  }

  return (
    <div className="space-y-3">
      {programs.map((program) => {
        const requirements = requirementsByProgram[program.id] ?? [];
        const evaluation = profile
          ? evaluateProgram(program.id, toRequirementInputs(requirements), studentCourses)
          : undefined;
        return (
          <ProgramCard
            key={program.id}
            program={program}
            status={evaluation?.status}
            saved={profile ? savedIds.has(program.id) : undefined}
          />
        );
      })}
    </div>
  );
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string }>;
}) {
  const { q, subject } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Find Programs</h1>
        <p className="text-muted-foreground">
          Search Canadian university programs and see how your profile compares.
        </p>
      </div>
      <ProgramFilterBar />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <ProgramResults q={q} subject={subject} />
      </Suspense>
    </div>
  );
}
