import type { Metadata } from "next";
import { RequestResetForm } from "@/features/auth/RequestResetForm";
import { SupabaseNotConfiguredNotice } from "@/components/SupabaseNotConfiguredNotice";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Reset your password" };

export default function ResetPasswordPage() {
  if (!isSupabaseConfigured()) return <SupabaseNotConfiguredNotice />;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a link to choose a new one.
        </p>
      </div>
      <RequestResetForm />
    </div>
  );
}
