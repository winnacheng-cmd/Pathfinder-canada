// Isomorphic env checks — safe to import from server or client code.

/**
 * Falls back to localhost whenever NEXT_PUBLIC_APP_URL is unset OR set to
 * an empty string — `??` alone doesn't catch the empty-string case, which
 * is exactly what happens when a host (e.g. Vercel) has the variable
 * declared with a blank value. That gap crashed `new URL(...)` in
 * layout.tsx with ERR_INVALID_URL on a real deploy — never use `??` for
 * this, always this helper.
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isAiConfigured() {
  const provider = process.env.AI_PROVIDER;
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  return false;
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}
