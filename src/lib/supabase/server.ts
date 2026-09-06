import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SupabaseNotConfiguredError } from "./errors";

/**
 * Server Component / Server Action / Route Handler Supabase client. Reads
 * the caller's session from cookies via @supabase/ssr, so RLS applies as
 * that user — never use the service-role client (admin.ts) for anything
 * that should be scoped to the signed-in user.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new SupabaseNotConfiguredError(
      [!url && "NEXT_PUBLIC_SUPABASE_URL", !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
        Boolean
      ) as string[]
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options ?? {});
          }
        } catch {
          // Called from a Server Component with no request context to write
          // to — safe to ignore as long as middleware.ts also refreshes the
          // session (it does; see src/middleware.ts).
        }
      },
    },
  });
}
