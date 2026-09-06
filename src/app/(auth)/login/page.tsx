import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";
import { SupabaseNotConfiguredNotice } from "@/components/SupabaseNotConfiguredNotice";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  if (!isSupabaseConfigured()) return <SupabaseNotConfiguredNotice />;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to see your saved programs.</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="underline underline-offset-2 text-foreground">
          Create an account
        </Link>
      </p>
    </div>
  );
}
