import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { SupabaseNotConfiguredNotice } from "@/components/SupabaseNotConfiguredNotice";
import { SupabaseNotConfiguredError } from "@/lib/supabase/errors";
import { PrintButton } from "@/features/application-plan/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Application Plan", robots: { index: false, follow: false } };

export default async function ApplicationPlanLayout({ children }: { children: React.ReactNode }) {
  let user, profile;
  try {
    ({ user, profile } = await getCurrentUserAndProfile());
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
    <div className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
      <div className="no-print mb-6 flex justify-end">
        <PrintButton />
      </div>
      {children}
    </div>
  );
}
