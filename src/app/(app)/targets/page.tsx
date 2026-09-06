import type { Metadata } from "next";
import Link from "next/link";
import { Target } from "lucide-react";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import { toRequirementInputs } from "@/domain/adapters";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getStudentCourseInputs } from "@/lib/queries/student-courses";
import { getSavedProgramsWithDetails } from "@/lib/queries/programs";
import { TargetsView, type EvaluatedSavedProgram } from "@/features/targets/TargetsView";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Target Programs" };
export const dynamic = "force-dynamic";

export default async function TargetsPage() {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return null; // (app) layout already redirects if there's no profile

  const [{ programs, requirementsByProgram }, studentCourses] = await Promise.all([
    getSavedProgramsWithDetails(profile.id),
    getStudentCourseInputs(profile.id),
  ]);

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Start with a goal"
        description="Search programs you're considering. Pathfinder will compare their requirements with your courses."
        action={
          <Button asChild>
            <Link href="/programs">Find Programs</Link>
          </Button>
        }
      />
    );
  }

  const items: EvaluatedSavedProgram[] = programs.map((program) => {
    const requirements = requirementsByProgram[program.id] ?? [];
    return {
      program,
      evaluation: evaluateProgram(program.id, toRequirementInputs(requirements), studentCourses),
      supplementalCount: requirements.filter((r) => r.requirement_type === "supplemental").length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Target Programs</h1>
        <p className="text-muted-foreground">
          {programs.length} saved program{programs.length === 1 ? "" : "s"}. Select up to 4 to compare.
        </p>
      </div>
      <TargetsView items={items} />
    </div>
  );
}
