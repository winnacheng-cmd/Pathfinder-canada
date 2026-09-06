import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MetricCard } from "@/components/MetricCard";
import { ActionCard } from "@/components/ActionCard";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { RequirementRow } from "@/components/RequirementRow";
import { SampleDataNotice } from "@/components/SampleDataNotice";
import { SimulatorView } from "@/features/simulator/SimulatorView";
import {
  demoActions,
  demoAvailableCourses,
  demoCounts,
  demoCourseNameByCode,
  demoProgramDetails,
  demoSimulatorCourses,
  demoSimulatorPrograms,
} from "@/features/demo/demo-data";

export const metadata: Metadata = {
  title: "Try the Demo",
  description: "See Pathfinder's eligibility checker, action plan, and what-if simulator with a sample BC Grade 12 profile — no signup required.",
};

export default function DemoPage() {
  return (
    <div className="min-h-svh bg-muted/20">
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          <span>You&apos;re viewing a demo profile — nothing here is saved.</span>
          <Button asChild size="sm" variant="secondary">
            <Link href="/signup">Create your own account</Link>
          </Button>
        </div>
      </div>

      <header className="mx-auto max-w-4xl px-4 pt-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Pathfinder Canada
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <GraduationCap className="size-8 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Demo Student — BC Grade 12</h1>
            <p className="text-muted-foreground">
              English Studies 12 (92%), Pre-Calculus 12 (84%), Chemistry 12 (91%), Biology 12 (90%),
              Anatomy &amp; Physiology 12 (94%), Physics 12 (planned).
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <SampleDataNotice />

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Saved programs" value={demoCounts.total} />
          <MetricCard label="Meet requirements" value={demoCounts.eligible} />
          <MetricCard label="Missing requirements" value={demoCounts.missing} />
          <MetricCard label="Needs review" value={demoCounts.needsReview} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Priority actions</h2>
          <div className="space-y-3">
            {demoActions.slice(0, 4).map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Target programs</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {demoProgramDetails.map(({ program, institution, requirements, status }) => (
              <AccordionItem
                key={program.id}
                value={program.id}
                className="rounded-lg border border-border px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pr-2 text-left">
                    <div>
                      <p className="font-medium">{program.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {institution.name} · {program.credential}
                      </p>
                    </div>
                    <EligibilityBadge status={status} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  {requirements.map(({ result, source }) => (
                    <RequirementRow key={result.requirementId} requirement={result} source={source} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">What-If Simulator</h2>
            <Badge variant="secondary">Try it</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Change a grade or add a course below — see what opens up instantly. Nothing here is saved
            unless you create an account.
          </p>
          <SimulatorView
            availableCourses={demoAvailableCourses}
            initialCourses={demoSimulatorCourses}
            programs={demoSimulatorPrograms}
            courseNameByCode={demoCourseNameByCode}
          />
        </section>

        <section className="rounded-lg border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-medium">Ready to check your own courses?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes under 3 minutes to set up your real profile.
          </p>
          <Button asChild className="mt-4">
            <Link href="/signup">Check My Options</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
