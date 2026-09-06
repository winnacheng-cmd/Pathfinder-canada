"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/env";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";

export type AuthActionState = { error?: string; success?: string } | undefined;

/**
 * Promotes a brand-new profile row to admin if its email is in ADMIN_EMAILS.
 * One-time bootstrap convenience only — see docs/DATABASE.md. Never fatal if
 * the service-role key isn't configured; the account is just left as
 * role='student' and can be promoted manually later via direct DB access.
 */
async function maybeBootstrapAdmin(userId: string, email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!adminEmails.includes(email.toLowerCase())) return;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
  } catch {
    // Supabase not configured for admin bootstrap — not fatal, see docstring.
  }
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  if (!data.user) {
    return { error: "Sign up succeeded but no session was returned. Try logging in." };
  }

  await maybeBootstrapAdmin(data.user.id, parsed.data.email);

  // If the Supabase project has "Confirm email" enabled (the default for a
  // new project), signUp() creates the user but returns no session — there's
  // nothing to redirect into yet. Say so explicitly instead of redirecting
  // to /onboarding and having its auth check silently bounce to /login with
  // no explanation, which is what happened before this fix.
  if (!data.session) {
    return {
      success:
        "Account created — check your email for a confirmation link before logging in. (Testing locally? You can turn off \"Confirm email\" in Supabase → Authentication → Sign In / Providers → Email, for faster iteration.)",
    };
  }

  redirect("/onboarding");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Incorrect email or password." };

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const appUrl = getAppUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/reset-password/confirm`,
  });
  // Don't reveal whether the email exists — same success message either way.
  if (error) return { error: "Something went wrong sending the reset email. Try again shortly." };
  return { success: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}
