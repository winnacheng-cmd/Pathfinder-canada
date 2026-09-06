"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SupabaseNotConfiguredError } from "./errors";
export { isSupabaseConfigured } from "@/lib/env";

/** Browser-side Supabase client, safe to import from any "use client" component. */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new SupabaseNotConfiguredError(
      [!url && "NEXT_PUBLIC_SUPABASE_URL", !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(
        Boolean
      ) as string[]
    );
  }

  return createBrowserClient(url, anonKey);
}
