import type { Metadata } from "next";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getBillingEntitlement } from "@/lib/queries/billing";
import { SettingsView } from "@/features/settings/SettingsView";
import { UpgradeButton } from "@/features/settings/UpgradeButton";
import { isStripeConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) return null;

  const entitlement = await getBillingEntitlement(profile.id);
  const plan = entitlement?.plan ?? "free";

  return (
    <div className="space-y-10">
      <SettingsView
        email={user.email ?? ""}
        initialGradeLevel={profile.grade_level}
        initialGraduationYear={profile.graduation_year}
        initialInterests={profile.interests}
      />
      <section className="max-w-xl space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-medium">Plan</h2>
        <p className="text-sm text-muted-foreground">
          Current plan: <span className="font-medium text-foreground">{plan.replace(/_/g, " ")}</span>.
          Everything on Pathfinder — including the printable application plan — is free today.
        </p>
        {plan === "free" && (isStripeConfigured() ? <UpgradeButton /> : (
          <p className="text-xs text-muted-foreground">
            Billing isn&apos;t configured in this deployment yet.
          </p>
        ))}
      </section>
    </div>
  );
}
