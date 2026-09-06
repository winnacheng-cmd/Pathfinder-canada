import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/features/marketing/LandingHeader";

export const metadata: Metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <div className="min-h-svh">
      <LandingHeader />
      <main className="mx-auto max-w-2xl space-y-8 px-4 pb-20 pt-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">How Pathfinder works</h1>
          <p className="mt-2 text-muted-foreground">
            This is the most important page on the site if you want to trust what Pathfinder tells
            you.
          </p>
        </div>

        <ol className="list-decimal space-y-3 pl-5">
          <li>You enter your courses, grades, and target programs.</li>
          <li>
            Each university requirement is stored as a structured rule — not a paragraph of text, a
            precise, testable condition (a required course, a minimum grade, a choose-N group, an
            average, or a non-academic supplemental requirement).
          </li>
          <li>
            A deterministic rules engine — plain code, not a language model — evaluates your profile
            against each rule and returns a specific status: met, missing, below minimum, planned,
            in progress, or needs review.
          </li>
          <li>
            An action engine turns unmet requirements into a ranked to-do list, prioritizing whatever
            affects the most of your saved programs.
          </li>
          <li>
            An AI model may summarize that structured result in plain language when you ask for an
            explanation — it only rephrases what the rules engine already decided.
          </li>
          <li>The official source behind every requirement stays one click away, with the date it was last verified.</li>
        </ol>

        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="font-medium">Pathfinder does not use AI to invent admission requirements.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            If an AI-generated explanation ever conflicts with the structured result on the same page,
            the structured result is correct — see docs/ADMISSIONS_RULES.md in the source repository
            for exactly how that&apos;s enforced in code.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Official minimum vs. competitive context vs. our advice</h2>
          <p className="text-muted-foreground">
            These are always kept visually and textually distinct. A published minimum grade is a
            fact from an official source. Historical competitiveness, when we mention it, is context —
            not a formal requirement. A suggestion like &quot;raising this grade would open two more
            programs&quot; is our own strategic read of your situation, never a guarantee of admission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Trust status</h2>
          <p className="text-muted-foreground">
            Every requirement carries one of three trust states: <strong>verified</strong> (checked
            against an official source within its expected recheck window), <strong>needs review</strong>{" "}
            (recently added or edited and not yet re-confirmed), or <strong>stale</strong> (past its
            recheck window). A stale or needs-review requirement is still shown — never hidden — with
            a visible warning that it needs re-verification before you rely on it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">About the current data</h2>
          <p className="text-muted-foreground">
            The institutions and programs in this product today are fictional sample data used to
            demonstrate the product, not real, verified admission requirements — they are clearly
            labeled as such wherever they appear. Real requirements will only ever be added through an
            admin workflow that requires an official source URL, an excerpt, a reviewer, and a
            verification date before anything can be marked verified.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Universities make final admission decisions — Pathfinder organizes their published
          requirements around your profile, it doesn&apos;t replace them. See{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline underline-offset-2">
            Terms
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
