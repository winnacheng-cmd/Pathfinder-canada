import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getActionPlanData } from "@/lib/queries/action-plan";
import { ActionCard } from "@/components/ActionCard";
import { ExplainPanel } from "@/features/ai/ExplainPanel";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export const metadata: Metadata = { title: "Action Plan" };
export const dynamic = "force-dynamic";

export default async function ActionPlanPage() {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return null;

  const { actions } = await getActionPlanData(profile);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Action Plan</h1>
          <p className="text-muted-foreground">
            Every outstanding action across your saved programs, ranked by how many it affects.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/application-plan">
            <FileDown className="size-4" />
            Printable version
          </Link>
        </Button>
      </div>

      {actions.length > 0 && <ExplainPanel />}

      {actions.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nothing outstanding"
          description="Every requirement across your saved programs is either met or being tracked. Check back after adding more target programs."
        />
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
