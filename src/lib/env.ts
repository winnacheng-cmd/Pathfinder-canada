// Isomorphic env checks — safe to import from server or client code.

/**
 * Resolves the app's own public URL, in order:
 * 1. NEXT_PUBLIC_APP_URL, if explicitly set (and non-empty — `??` alone
 *    doesn't catch an empty string, which is exactly what a host like
 *    Vercel produces when the variable is declared with a blank value;
 *    that gap crashed `new URL(...)` in layout.tsx with ERR_INVALID_URL
 *    on a real deploy).
 * 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel auto-injects this with the
 *    project's production domain, no configuration needed.
 * 3. VERCEL_URL — Vercel auto-injects this with the current deployment's
 *    domain (preview or production), also no configuration needed.
 * 4. http://localhost:3000 as a last resort for local dev.
 *
 * (2) and (3) exist so a fresh Vercel deploy gets the right URL for things
 * like signup-confirmation email links even if nobody remembers to set
 * NEXT_PUBLIC_APP_URL — that exact gap sent a real confirmation email to
 * localhost:3000 in production once. Both vars come back without a
 * protocol, so https:// is prepended. Server-only: never referenced from
 * a "use client" file, so reading non-NEXT_PUBLIC_ vars here is safe.
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://localhost:3000";
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
