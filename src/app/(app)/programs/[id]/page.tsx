import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import { toRequirementInputs } from "@/domain/adapters";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getStudentCourseInputs } from "@/lib/queries/student-courses";
import { getProgramDetail, getSavedProgramIds } from "@/lib/queries/programs";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { RequirementRow } from "@/components/RequirementRow";
import { SaveProgramButton } from "@/features/programs/SaveProgramButton";
import { ReportIssueDialog } from "@/features/programs/ReportIssueDialog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getProgramDetail(id);
  return { title: detail ? `${detail.program.name} — ${detail.program.institution.name}` : "Program" };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProgramDetail(id);
  if (!detail) notFound();

  const { profile } = await getCurrentUserAndProfile();
  const [savedIds, studentCourses] = await Promise.all([
    profile ? getSavedProgramIds(profile.id) : Promise.resolve(new Set<string>()),
    profile ? getStudentCourseInputs(profile.id) : Promise.resolve([]),
  ]);

  const evaluation = profile
    ? evaluateProgram(detail.program.id, toRequirementInputs(detail.requirements), studentCourses)
    : null;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{detail.program.name}</h1>
            <p className="text-muted-foreground">
              {detail.program.institution.name} · {detail.program.credential}
              {detail.program.faculty ? ` · ${detail.program.faculty}` : ""}
            </p>
          </div>
          {profile && (
            <SaveProgramButton
              programId={detail.program.id}
              initiallySaved={savedIds.has(detail.program.id)}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>Campus: {detail.program.campus ?? "—"}</span>
          <span aria-hidden="true">·</span>
          <span>Intake: {detail.program.intake_year}</span>
          {detail.program.application_url && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={detail.program.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Official application page
              </a>
            </>
          )}
        </div>

        {evaluation && <EligibilityBadge status={evaluation.status} />}
        {!profile && (
          <p className="text-sm text-muted-foreground">
            Complete your profile to see your personal status against each requirement.
          </p>
        )}
      </div>

      {detail.program.description && <p className="text-sm">{detail.program.description}</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Requirements</h2>
        <div className="space-y-3">
          {evaluation
            ? evaluation.requirements.map((r) => (
                <RequirementRow
                  key={r.requirementId}
                  requirement={r}
                  source={r.sourceSnapshotId ? detail.sourceSnapshotsById[r.sourceSnapshotId] : undefined}
                />
              ))
            : detail.requirements.map((r) => (
                <div key={r.id} className="rounded-md border border-border p-4">
                  <p className="font-medium">{r.display_text}</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your profile to see your personal status here.
                  </p>
                </div>
              ))}
        </div>
      </section>

      {detail.supplementalRequirements.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Supplemental checklist</h2>
          <ul className="space-y-2">
            {detail.supplementalRequirements.map((s) => (
              <li key={s.id} className="rounded-md border border-border p-4">
                <p className="font-medium">{s.title}</p>
                {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                {s.deadline && (
                  <p className="text-sm text-muted-foreground">Deadline: {s.deadline}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReportIssueDialog programId={detail.program.id} />
    </div>
  );
}
