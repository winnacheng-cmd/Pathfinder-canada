import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Target, Sparkles } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getStudentCoursesWithInfo } from "@/lib/queries/student-courses";
import { getActionPlanData } from "@/lib/queries/action-plan";
import { MetricCard } from "@/components/MetricCard";
import { ActionCard } from "@/components/ActionCard";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { EmptyState } from "@/components/EmptyState";
import { SourceLink } from "@/components/SourceLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExplainPanel } from "@/features/ai/ExplainPanel";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return null;

  const studentCourses = await getStudentCoursesWithInfo(profile.id);

  if (studentCourses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Tell us what you're taking"
        description="Add your courses and grades so Pathfinder can check them against real program requirements."
        action={
          <Button asChild>
            <Link href="/courses">Add My Courses</Link>
          </Button>
        }
      />
    );
  }

  const { evaluations, actions, counts, recentlyVerifiedSources } = await getActionPlanData(profile);

  if (counts.total === 0) {
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

  const topActions = actions.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">What to care about today.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Saved programs" value={counts.total} />
        <MetricCard label="Meet requirements" value={counts.eligible} />
        <MetricCard label="Missing requirements" value={counts.missing} />
        <MetricCard label="Needs review" value={counts.needsReview} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Highest-priority actions</h2>
          <div className="flex items-center gap-3">
            <ExplainPanel />
            {actions.length > 3 && (
              <Link href="/action-plan" className="text-sm text-primary underline underline-offset-2">
                See all {actions.length}
              </Link>
            )}
          </div>
        </div>
        {topActions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing outstanding right now — nice work.
          </p>
        ) : (
          <div className="space-y-3">
            {topActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Target programs</h2>
            <Link href="/targets" className="text-sm text-primary underline underline-offset-2">
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {evaluations.slice(0, 5).map(({ programId, programName, evaluation }) => (
              <li key={programId} className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
                <Link href={`/programs/${programId}`} className="text-sm font-medium hover:underline">
                  {programName}
                </Link>
                <EligibilityBadge status={evaluation.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Recently verified requirements</h2>
          {recentlyVerifiedSources.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing verified yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentlyVerifiedSources.map((source) => (
                <li key={source.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">{source.page_title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Verified {source.verified_at}</span>
                    <SourceLink url={source.source_url} label="View" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Card className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">Try a scenario</p>
            <p className="text-sm text-muted-foreground">
              What if one of your grades changed? See what opens up before you decide anything.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/simulator">Open What-If Simulator</Link>
        </Button>
      </Card>
    </div>
  );
}
