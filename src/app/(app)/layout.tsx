import { redirect } from "next/navigation";
import { getCurrentUserAndProfile, getMyRole } from "@/lib/queries/profile";
import { SupabaseNotConfiguredNotice } from "@/components/SupabaseNotConfiguredNotice";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
import { AppNav } from "@/features/app-shell/AppNav";

// Every page under this layout is personalized (auth + own profile data) —
// never statically prerender. See onboarding/layout.tsx for why this must
// be explicit rather than inferred from a dynamic API call.
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user, profile, role;
  try {
    ({ user, profile } = await getCurrentUserAndProfile());
    role = user ? await getMyRole() : null;
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
  if (!profile) redirect("/onboarding");

  return (
    <div className="flex min-h-svh flex-col">
      <AppNav isAdmin={role === "admin"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
