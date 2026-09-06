"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, writeAuditLog } from "@/lib/queries/admin";
import { parseRuleJson } from "@/domain/eligibility/rule-schema";
import {
  courseSchema,
  feedbackStatusSchema,
  institutionSchema,
  programSchema,
  requirementFormSchema,
  sourceSchema,
} from "@/lib/validation/admin";

export type AdminActionState = { error?: string; success?: string } | undefined;

function revalidateAdminAndPublic() {
  revalidatePath("/admin");
  revalidatePath("/admin/institutions");
  revalidatePath("/admin/programs");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/requirements");
  revalidatePath("/admin/sources");
  revalidatePath("/programs");
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------- institutions
export async function upsertInstitutionAction(input: unknown): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = institutionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid institution." };

  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  const { data, error } = await supabase
    .from("institutions")
    .upsert({ id, ...values })
    .select("id")
    .single();
  if (error || !data) return { error: "Couldn't save institution." };

  await writeAuditLog({
    adminUserId: admin.id,
    entityType: "institution",
    entityId: data.id,
    action: id ? "update" : "create",
    afterJson: values,
  });
  revalidateAdminAndPublic();
  return { success: "Institution saved." };
}

// ---------------------------------------------------------------- programs
export async function upsertProgramAction(input: unknown): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = programSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid program." };

  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  const cleaned = { ...values, application_url: values.application_url || null };
  const { data, error } = await supabase
    .from("programs")
    .upsert({ id, ...cleaned })
    .select("id")
    .single();
  if (error || !data) return { error: "Couldn't save program." };

  await writeAuditLog({
    adminUserId: admin.id,
    entityType: "program",
    entityId: data.id,
    action: id ? "update" : "create",
    afterJson: cleaned,
  });
  revalidateAdminAndPublic();
  return { success: "Program saved." };
}

// ---------------------------------------------------------------- courses
export async function upsertCourseAction(input: unknown): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid course." };

  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  const { data, error } = await supabase
    .from("courses")
    .upsert({ id, ...values })
    .select("id")
    .single();
  if (error || !data) return { error: "Couldn't save course." };

  await writeAuditLog({
    adminUserId: admin.id,
    entityType: "course",
    entityId: data.id,
    action: id ? "update" : "create",
    afterJson: values,
  });
  revalidateAdminAndPublic();
  return { success: "Course saved." };
}

// ---------------------------------------------------------------- sources
export async function upsertSourceAction(input: unknown): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = sourceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid source." };

  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  const cleaned = { ...values, expires_at: values.expires_at || null };
  const { data, error } = await supabase
    .from("source_snapshots")
    .upsert({ id, ...cleaned })
    .select("id")
    .single();
  if (error || !data) return { error: "Couldn't save source." };

  await writeAuditLog({
    adminUserId: admin.id,
    entityType: "source_snapshot",
    entityId: data.id,
    action: id ? "update" : "create",
    afterJson: cleaned,
  });
  revalidateAdminAndPublic();
  return { success: "Source saved." };
}

// ---------------------------------------------------------------- requirements
function buildRuleJson(data: ReturnType<typeof requirementFormSchema.parse>) {
  const courseCodes = (data.courseCodes ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  switch (data.operator) {
    case "ANY_OF":
      return {
        operator: "ANY_OF" as const,
        courseCodes,
        ...(data.minimumGrade !== "" && data.minimumGrade !== undefined
          ? { minimumGrade: data.minimumGrade }
          : {}),
      };
    case "AT_LEAST_N":
      return {
        operator: "AT_LEAST_N" as const,
        n: Number(data.n),
        courseCodes,
        ...(data.minimumGrade !== "" && data.minimumGrade !== undefined
          ? { minimumGrade: data.minimumGrade }
          : {}),
      };
    case "AVERAGE_OF_SELECTED":
      return { operator: "AVERAGE_OF_SELECTED" as const, courseCodes, minimum: Number(data.minimum) };
    case "SUPPLEMENTAL_REQUIRED":
      return { operator: "SUPPLEMENTAL_REQUIRED" as const, type: data.supplementalType! };
    case "GRADUATION_REQUIREMENT":
      return {
        operator: "GRADUATION_REQUIREMENT" as const,
        ...(data.graduationDescription ? { description: data.graduationDescription } : {}),
      };
  }
}

export async function upsertRequirementAction(input: unknown): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const parsed = requirementFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid requirement." };

  const ruleJson = buildRuleJson(parsed.data);
  const ruleCheck = parseRuleJson(ruleJson);
  if (!ruleCheck.success) {
    return { error: `Rule failed validation: ${ruleCheck.error.issues[0]?.message}` };
  }

  if (parsed.data.status === "verified" && !parsed.data.source_snapshot_id) {
    return { error: "A verified requirement needs a source." };
  }

  const supabase = await createClient();
  const { id, operator: _operator, courseCodes: _courseCodes, minimumGrade: _minimumGrade, n: _n, minimum: _minimum, supplementalType: _supplementalType, graduationDescription: _graduationDescription, ...rest } = parsed.data;
  const values = {
    ...rest,
    rule_json: ruleJson,
    source_snapshot_id: parsed.data.source_snapshot_id || null,
  };

  const { data, error } = await supabase
    .from("program_requirements")
    .upsert({ id, ...values })
    .select("id")
    .single();
  if (error || !data) return { error: "Couldn't save requirement." };

  await writeAuditLog({
    adminUserId: admin.id,
    entityType: "program_requirement",
    entityId: data.id,
    action: id ? "update" : "create",
    afterJson: values,
  });
  revalidateAdminAndPublic();
  return { success: "Requirement saved." };
}

export async function deleteRequirementAction(id: string): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: before } = await supabase.from("program_requirements").select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from("program_requirements").delete().eq("id", id);
  if (error) return { error: "Couldn't delete requirement." };

  await writeAuditLog({
    adminUserId: admin.id,
    entityType: "program_requirement",
    entityId: id,
    action: "delete",
    beforeJson: before,
  });
  revalidateAdminAndPublic();
  return { success: "Requirement deleted." };
}

// ---------------------------------------------------------------- feedback
export async function updateFeedbackStatusAction(input: unknown): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = feedbackStatusSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid status." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("feedback")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return { error: "Couldn't update feedback." };

  revalidatePath("/admin/feedback");
  return { success: "Updated." };
}
