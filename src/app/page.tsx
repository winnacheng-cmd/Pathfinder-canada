import Link from "next/link";
import {
  BookMarked,
  CheckCircle2,
  FlaskConical,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequirementStatusIcon } from "@/components/RequirementStatusIcon";
import { VerifiedSourceBadge } from "@/components/VerifiedSourceBadge";
import { LandingHeader } from "@/features/marketing/LandingHeader";

const FEATURES = [
  {
    icon: CheckCircle2,
    title: "Eligibility checker",
    description: "See rule-by-rule whether you meet each program's published requirements.",
  },
  {
    icon: ListChecks,
    title: "Missing requirement detection",
    description: "Know exactly which course or grade is standing between you and a program.",
  },
  {
    icon: FlaskConical,
    title: "What-if simulator",
    description: "Test a grade or course change before you commit to it.",
  },
  {
    icon: Sparkles,
    title: "Personalized action plan",
    description: "Ranked next steps based on how many of your saved programs they'd open.",
  },
  {
    icon: ShieldCheck,
    title: "Official sources",
    description: "Every requirement links back to where it actually came from.",
  },
  {
    icon: BookMarked,
    title: "Verification dates",
    description: "Know exactly when a requirement was last checked — and if it's due for a recheck.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh">
      <LandingHeader />

      <main>
        <section className="mx-auto max-w-3xl px-4 pb-16 pt-10 text-center sm:pt-16">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Know exactly what your grades open.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Enter your courses and target programs. Pathfinder shows what you qualify for, what
            you&apos;re missing, and what changes your options.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">Check My Options</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">Try Demo Student</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            No made-up admission probabilities — ever.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="p-6">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Your profile</p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Pre-Calculus 12</span>
                  <span className="font-medium">84%</span>
                </li>
                <li className="flex justify-between">
                  <span>Chemistry 12</span>
                  <span className="font-medium">91%</span>
                </li>
                <li className="flex justify-between">
                  <span>Biology 12</span>
                  <span className="font-medium">94%</span>
                </li>
                <li className="flex justify-between">
                  <span>English Studies 12</span>
                  <span className="font-medium">92%</span>
                </li>
              </ul>
            </Card>
            <Card className="p-6">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Example result</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Biology requirement</span>
                  <RequirementStatusIcon status="met" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Chemistry requirement</span>
                  <RequirementStatusIcon status="met" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Pre-Calculus minimum: 90%</span>
                  <RequirementStatusIcon status="below_minimum" />
                </li>
              </ul>
              <div className="mt-4 rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">Next action</p>
                <p className="text-muted-foreground">
                  Improving Pre-Calculus from 84% → 90% opens <strong className="text-foreground">3 saved programs</strong>.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16">
          <Card className="grid gap-6 p-6 sm:grid-cols-3 sm:items-center">
            <div className="sm:col-span-1">
              <Badge variant="secondary" className="mb-2">
                One grade changes everything
              </Badge>
              <p className="text-sm text-muted-foreground">
                Test it yourself in the what-if simulator — no commitment, nothing saved until you
                choose to.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 sm:col-span-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Pre-Calculus 12</p>
                <p className="text-2xl font-semibold">84%</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">What if</p>
                <p className="text-2xl font-semibold text-primary">90%</p>
              </div>
              <span className="text-muted-foreground">=</span>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Result</p>
                <p className="text-2xl font-semibold text-success">+2 programs</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
            Stop searching ten university websites
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="space-y-2">
                <feature.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-20 text-center">
          <div className="flex items-center justify-center gap-2">
            <VerifiedSourceBadge status="verified" />
            <span className="text-sm text-muted-foreground">Know why.</span>
          </div>
          <p className="mt-2 text-muted-foreground">
            Every requirement links back to its source. Pathfinder organizes official admission
            requirements around your actual academic profile — it never invents them.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/signup">Check My Options</Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-muted-foreground">
          <span>Pathfinder Canada</span>
          <nav className="flex gap-4">
            <Link href="/methodology" className="hover:text-foreground">
              Methodology
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
