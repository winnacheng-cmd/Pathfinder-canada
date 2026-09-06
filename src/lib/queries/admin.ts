import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyRole } from "./profile";

/**
 * Server-side admin gate. Never trust a client-hidden nav link — every admin
 * route's layout calls this, and RLS backs it up at the database layer too
 * (see supabase/migrations/*_rls.sql `is_admin()`). Redirects rather than
 * throwing so a non-admin hitting an admin URL directly gets a normal
 * redirect instead of an error page.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = await getMyRole();
  if (role !== "admin") redirect("/dashboard");

  return user;
}

export async function writeAuditLog(entry: {
  adminUserId: string;
  entityType: string;
  entityId: string;
  action: "create" | "update" | "delete";
  beforeJson?: unknown;
  afterJson?: unknown;
}) {
  const supabase = await createClient();
  await supabase.from("admin_audit_log").insert({
    admin_user_id: entry.adminUserId,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    action: entry.action,
    before_json: entry.beforeJson ?? null,
    after_json: entry.afterJson ?? null,
  });
}
