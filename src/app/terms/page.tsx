import type { Metadata } from "next";
import { LandingHeader } from "@/features/marketing/LandingHeader";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="min-h-svh">
      <LandingHeader />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-20 pt-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a starter terms-of-use template for an early-stage product and has not had a
            legal review. Do not treat it as a finished legal document.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">What Pathfinder is</h2>
          <p className="text-muted-foreground">
            Pathfinder helps you organize published Canadian university admission requirements
            against your own courses and grades, and suggests actions and scenarios based on that
            comparison.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">What Pathfinder is not</h2>
          <p className="text-muted-foreground">
            Pathfinder is not an admissions authority. Universities make final admission decisions,
            and requirements can change. Pathfinder does not guarantee admission to any program, does
            not submit applications on your behalf, and does not provide an admission probability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Verify before you rely on it</h2>
          <p className="text-muted-foreground">
            Always confirm high-stakes decisions — course selection, applications, deadlines — with
            the official university or your school counsellor. Requirement data can be stale or
            wrong; use the &quot;Report an issue&quot; option if you find something that looks
            incorrect.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Your account</h2>
          <p className="text-muted-foreground">
            You&apos;re responsible for the accuracy of the courses and grades you enter. You can
            export or permanently delete your data at any time from Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium">Acceptable use</h2>
          <p className="text-muted-foreground">
            Don&apos;t use Pathfinder to submit false data-quality reports, attempt to access another
            user&apos;s data, or interfere with the service.
          </p>
        </section>
      </main>
    </div>
  );
}
