import type { Metadata } from "next";
import { ConfirmResetForm } from "@/features/auth/ConfirmResetForm";
import { SupabaseNotConfiguredNotice } from "@/components/SupabaseNotConfiguredNotice";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ConfirmResetPasswordPage() {
  if (!isSupabaseConfigured()) return <SupabaseNotConfiguredNotice />;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Opened from the reset link in your email.
        </p>
      </div>
      <ConfirmResetForm />
    </div>
  );
}
