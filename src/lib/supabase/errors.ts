/**
 * Thrown by every Supabase client factory when required env vars are
 * missing, instead of letting `createClient` fail with an opaque error deep
 * in a request. Callers (server components/actions) should catch this and
 * render an EmptyState pointing at README.md — see docs/ARCHITECTURE.md
 * "Why Supabase, and how the app behaves without it".
 */
export class SupabaseNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(
      `Supabase is not configured — missing env var(s): ${missing.join(", ")}. ` +
        "See README.md 'Supabase setup'. Public pages and /demo work without this."
    );
    this.name = "SupabaseNotConfiguredError";
  }
}
