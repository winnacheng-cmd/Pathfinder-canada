import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/SignupForm";
import { SupabaseNotConfiguredNotice } from "@/components/SupabaseNotConfiguredNotice";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  if (!isSupabaseConfigured()) return <SupabaseNotConfiguredNotice />;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Check your options</h1>
        <p className="text-sm text-muted-foreground">
          Takes under 3 minutes — or try the demo profile first.
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-2 text-foreground">
          Log in
        </Link>
      </p>
    </div>
  );
}
