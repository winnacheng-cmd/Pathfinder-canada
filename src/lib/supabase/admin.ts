import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SupabaseNotConfiguredError } from "./errors";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely — only
 * use this for: the seed script, the admin-bootstrap promotion in the
 * signup action, account deletion cascades, and admin_audit_log writes.
 * `import "server-only"` makes bundling this into a client component a
 * build error rather than a runtime secret leak.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseNotConfiguredError(
      [!url && "NEXT_PUBLIC_SUPABASE_URL", !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY"].filter(
        Boolean
      ) as string[]
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
