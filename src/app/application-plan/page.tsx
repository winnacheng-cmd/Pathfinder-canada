import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getActionPlanData } from "@/lib/queries/action-plan";
import { getAllSourcesForPrograms } from "@/lib/queries/programs";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { RequirementStatusIcon } from "@/components/RequirementStatusIcon";
import { siteConfig } from "@/config/site";

export default async function ApplicationPlanPage() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) return null;

  const { evaluations, actions, counts, supplementalRequirements } = await getActionPlanData(profile);
  const sources = await getAllSourcesForPrograms(evaluations.map((e) => e.programId));

  const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <article className="space-y-10 text-sm leading-relaxed print:text-[11pt]">
      <header className="space-y-1 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Pathfinder Application Plan</h1>
        <p className="text-muted-foreground">Generated {today} for {user.email}</p>
      </header>

      <section>
        <h2 className="mb-2 text-lg font-medium">Student summary</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Province</dt>
          <dd>{profile.province}</dd>
          <dt className="text-muted-foreground">Curriculum</dt>
          <dd>{profile.curriculum}</dd>
          <dt className="text-muted-foreground">Grade level</dt>
          <dd>{profile.grade_level.replace(/_/g, " ")}</dd>
          <dt className="text-muted-foreground">Expected graduation</dt>
          <dd>{profile.graduation_year}</dd>
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Eligibility overview</h2>
        <p>
          {counts.total} saved programs — {counts.eligible} meet published requirements,{" "}
          {counts.conditionallyEligible} conditionally eligible (pending a supplemental item),{" "}
          {counts.missing} missing at least one requirement, {counts.needsReview} needing re-verification.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Target programs</h2>
        {evaluations.map(({ programId, programName, evaluation }) => (
          <div key={programId} className="space-y-1.5 border-b border-border pb-3 last:border-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{programName}</p>
              <EligibilityBadge status={evaluation.status} />
            </div>
            <ul className="space-y-1 pl-4">
              {evaluation.requirements.map((r) => (
                <li key={r.requirementId} className="flex items-center justify-between gap-2">
                  <span>{r.displayText}</span>
                  <RequirementStatusIcon status={r.status} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Priority actions</h2>
        {actions.length === 0 ? (
          <p className="text-muted-foreground">Nothing outstanding right now.</p>
        ) : (
          <ol className="list-decimal space-y-2 pl-5">
            {actions.map((action) => (
              <li key={action.id}>
                <p className="font-medium">{action.title}</p>
                <p className="text-muted-foreground">{action.explanation}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {supplementalRequirements.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Supplemental checklist</h2>
          <ul className="space-y-1 pl-4">
            {supplementalRequirements.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <span>{s.title}</span>
                <span className="text-muted-foreground">{s.deadline ? `Due ${s.deadline}` : "No deadline listed"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">What-if opportunities</h2>
        <p className="text-muted-foreground">
          Run a what-if scenario in the app to see exactly which programs a specific grade or course
          change would open — that comparison is interactive and isn&apos;t reproduced in this printed
          plan.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Sources</h2>
        {sources.length === 0 ? (
          <p className="text-muted-foreground">No sources on file yet.</p>
        ) : (
          <ul className="space-y-1.5 pl-4">
            {sources.map((source) => (
              <li key={source.id} className="flex flex-wrap items-center justify-between gap-2">
                <a href={source.source_url} className="underline underline-offset-2">
                  {source.page_title}
                </a>
                <span className="text-muted-foreground">Verified {source.verified_at}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
        {siteConfig.disclaimer}
      </footer>
    </article>
  );
}
