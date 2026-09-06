import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/profile";
import { SupabaseNotConfiguredNotice } from "@/components/SupabaseNotConfiguredNotice";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";

// Depends on the caller's auth/session state — must never be statically
// prerendered (the SupabaseNotConfiguredError check runs before any dynamic
// API call Next.js could otherwise detect automatically).
export const dynamic = "force-dynamic";
export const metadata = { title: "Set up your profile", robots: { index: false, follow: false } };

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (e) {
    if (e instanceof SupabaseNotConfiguredError) {
      return (
        <div className="min-h-svh flex items-center">
          <SupabaseNotConfiguredNotice />
        </div>
      );
    }
    throw e;
  }

  if (!user) redirect("/login");

  return (
    <div className="min-h-svh bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-center text-lg font-semibold tracking-tight">Pathfinder Canada</h1>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </div>
  );
}
