import { DatabaseZap } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";

/** Shown instead of crashing whenever SupabaseNotConfiguredError is caught. */
export function SupabaseNotConfiguredNotice() {
  return (
    <div className="mx-auto max-w-lg py-16 px-4">
      <EmptyState
        icon={DatabaseZap}
        title="Backend not configured"
        description="This page needs a connected Supabase project. Try the demo instead, or follow the Supabase setup steps in README.md to enable accounts and saved data."
        action={
          <Button asChild>
            <a href="/demo">Try Demo Student instead</a>
          </Button>
        }
      />
    </div>
  );
}
