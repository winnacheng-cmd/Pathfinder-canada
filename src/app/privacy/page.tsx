import type { Metadata } from "next";
import { LandingHeader } from "@/features/marketing/LandingHeader";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-svh">
      <LandingHeader />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-20 pt-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a starter policy for an early-stage product and has not had a legal review. Do
            not treat it as a finished legal document.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">What we collect</h2>
          <p className="text-muted-foreground">
            Your province, curriculum, grade level, expected graduation year, the courses and grades
            you enter, optional broad interest categories, and the programs you save. We don&apos;t
            ask for health information, disability status, household income, ethnicity, religion,
            sexual orientation, your exact home address, or an unnecessary birth date — there&apos;s
            no field for any of it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Minors</h2>
          <p className="text-muted-foreground">
            Most Pathfinder users are expected to be under 18. We don&apos;t use engagement mechanics
            designed to create dependency — no streaks, no urgency nudges, no guilt-based prompts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Who can see your data</h2>
          <p className="text-muted-foreground">
            Only you. Administrators manage the program/requirement catalog and review data-quality
            reports — they do not have access to your personal academic profile, courses, saved
            programs, or scenarios.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">AI explanations</h2>
          <p className="text-muted-foreground">
            If you ask for an AI-generated explanation, only the already-computed structured result
            (counts and ranked actions) is sent to the model — never your email, account details, or
            raw free-text.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Your controls</h2>
          <p className="text-muted-foreground">
            From Settings you can export your data as a file, or permanently delete your account —
            which removes your profile, courses, saved programs, and scenarios, and your login. Reports
            you&apos;ve submitted about incorrect data are kept for data-quality purposes but
            disconnected from your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Analytics</h2>
          <p className="text-muted-foreground">
            We may record which features get used (e.g., that a scenario was run) but never the
            content of your grades or courses in that tracking.
          </p>
        </section>
      </main>
    </div>
  );
}
