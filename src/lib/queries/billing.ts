import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BillingEntitlement } from "@/types/database";

export async function getBillingEntitlement(studentProfileId: string): Promise<BillingEntitlement | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("billing_entitlements")
    .select("*")
    .eq("student_profile_id", studentProfileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
