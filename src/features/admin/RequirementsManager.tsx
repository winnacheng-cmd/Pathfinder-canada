"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormMessage } from "@/components/FormMessage";
import { VerifiedSourceBadge } from "@/components/VerifiedSourceBadge";
import { describeRule } from "@/domain/eligibility/rule-schema";
import { deleteRequirementAction, upsertRequirementAction } from "./actions";
import type { RequirementWithContext } from "@/lib/queries/admin-catalog";
import type { ProgramWithInstitutionName } from "@/lib/queries/admin-catalog";
import type { SourceSnapshot } from "@/types/database";

type Operator = "ANY_OF" | "AT_LEAST_N" | "AVERAGE_OF_SELECTED" | "SUPPLEMENTAL_REQUIRED" | "GRADUATION_REQUIREMENT";

interface FormState {
  id: string;
  program_id: string;
  requirement_type:
    | "required_course"
    | "course_minimum"
    | "overall_average_minimum"
    | "choose_n_from_group"
    | "graduation_requirement"
    | "supplemental"
    | "language"
    | "notes";
  operator: Operator;
  courseCodes: string;
  minimumGrade: string;
  n: string;
  minimum: string;
  supplementalType: "personal_profile" | "supplementary_application" | "interview" | "portfolio" | "audition";
  graduationDescription: string;
  display_text: string;
  source_snapshot_id: string;
  effective_cycle: string;
  status: "verified" | "needs_review" | "stale";
}

function emptyForm(programId: string): FormState {
  return {
    id: "",
    program_id: programId,
    requirement_type: "required_course",
    operator: "ANY_OF",
    courseCodes: "",
    minimumGrade: "",
    n: "2",
    minimum: "",
    supplementalType: "personal_profile",
    graduationDescription: "",
    display_text: "",
    source_snapshot_id: "",
    effective_cycle: "2027-2028",
    status: "needs_review",
  };
}

function previewFor(form: FormState): string {
  const courseCodes = form.courseCodes
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  try {
    switch (form.operator) {
      case "ANY_OF":
        return describeRule({
          operator: "ANY_OF",
          courseCodes,
          ...(form.minimumGrade ? { minimumGrade: Number(form.minimumGrade) } : {}),
        });
      case "AT_LEAST_N":
        return describeRule({
          operator: "AT_LEAST_N",
          n: Number(form.n) || 1,
          courseCodes,
          ...(form.minimumGrade ? { minimumGrade: Number(form.minimumGrade) } : {}),
        });
      case "AVERAGE_OF_SELECTED":
        return describeRule({ operator: "AVERAGE_OF_SELECTED", courseCodes, minimum: Number(form.minimum) || 0 });
      case "SUPPLEMENTAL_REQUIRED":
        return describeRule({ operator: "SUPPLEMENTAL_REQUIRED", type: form.supplementalType });
      case "GRADUATION_REQUIREMENT":
        return describeRule({
          operator: "GRADUATION_REQUIREMENT",
          ...(form.graduationDescription ? { description: form.graduationDescription } : {}),
        });
    }
  } catch {
    return "Fill in the fields above to see a preview.";
  }
}

export function RequirementsManager({
  initial,
  programs,
  sources,
}: {
  initial: RequirementWithContext[];
  programs: ProgramWithInstitutionName[];
  sources: SourceSnapshot[];
}) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(programs[0]?.id ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const preview = useMemo(() => previewFor(form), [form]);

  function openCreate() {
    setForm(emptyForm(programs[0]?.id ?? ""));
    setError(null);
    setOpen(true);
  }

  function openEdit(row: RequirementWithContext) {
    const rule = row.rule_json as Record<string, unknown>;
    setForm({
      id: row.id,
      program_id: row.program_id,
      requirement_type: row.requirement_type,
      operator: (rule.operator as Operator) ?? "ANY_OF",
      courseCodes: Array.isArray(rule.courseCodes) ? (rule.courseCodes as string[]).join(", ") : "",
      minimumGrade: typeof rule.minimumGrade === "number" ? String(rule.minimumGrade) : "",
      n: typeof rule.n === "number" ? String(rule.n) : "2",
      minimum: typeof rule.minimum === "number" ? String(rule.minimum) : "",
      supplementalType: (rule.type as FormState["supplementalType"]) ?? "personal_profile",
      graduationDescription: typeof rule.description === "string" ? rule.description : "",
      display_text: row.display_text,
      source_snapshot_id: row.source_snapshot_id ?? "",
      effective_cycle: row.effective_cycle,
      status: row.status,
    });
    setError(null);
    setOpen(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertRequirementAction({
        id: form.id || undefined,
        program_id: form.program_id,
        requirement_type: form.requirement_type,
        operator: form.operator,
        courseCodes: form.courseCodes,
        minimumGrade: form.minimumGrade === "" ? "" : Number(form.minimumGrade),
        n: form.n === "" ? "" : Number(form.n),
        minimum: form.minimum === "" ? "" : Number(form.minimum),
        supplementalType: form.supplementalType,
        graduationDescription: form.graduationDescription,
        display_text: form.display_text,
        source_snapshot_id: form.source_snapshot_id,
        effective_cycle: form.effective_cycle,
        status: form.status,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      // Simplicity over cleverness: reload the list from the server rather
      // than reconstructing the joined display row (programName/sourceTitle)
      // client-side.
      window.location.reload();
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this requirement? This can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteRequirementAction(id);
      if (result?.error) setError(result.error);
      else setRows((prev) => prev.filter((r) => r.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Requirements</h1>
        <Button size="sm" onClick={openCreate} disabled={programs.length === 0}>
          <Plus className="size-4" />
          Add requirement
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Trust</TableHead>
              <TableHead>Source</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.programName}</TableCell>
                <TableCell className="max-w-[280px]">{row.display_text}</TableCell>
                <TableCell>
                  <VerifiedSourceBadge status={row.status} />
                </TableCell>
                <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                  {row.sourceTitle ?? "None"}
                </TableCell>
                <TableCell className="space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(row.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit requirement" : "Add requirement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Program</Label>
              <Select value={form.program_id} onValueChange={(program_id) => setForm({ ...form, program_id })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.institutionName} — {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Requirement type</Label>
                <Select
                  value={form.requirement_type}
                  onValueChange={(v) => setForm({ ...form, requirement_type: v as FormState["requirement_type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "required_course",
                      "course_minimum",
                      "overall_average_minimum",
                      "choose_n_from_group",
                      "graduation_requirement",
                      "supplemental",
                      "language",
                      "notes",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Rule operator</Label>
                <Select value={form.operator} onValueChange={(v) => setForm({ ...form, operator: v as Operator })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY_OF">ANY_OF</SelectItem>
                    <SelectItem value="AT_LEAST_N">AT_LEAST_N</SelectItem>
                    <SelectItem value="AVERAGE_OF_SELECTED">AVERAGE_OF_SELECTED</SelectItem>
                    <SelectItem value="SUPPLEMENTAL_REQUIRED">SUPPLEMENTAL_REQUIRED</SelectItem>
                    <SelectItem value="GRADUATION_REQUIREMENT">GRADUATION_REQUIREMENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(form.operator === "ANY_OF" || form.operator === "AT_LEAST_N" || form.operator === "AVERAGE_OF_SELECTED") && (
              <div className="space-y-1.5">
                <Label>Course codes (comma-separated)</Label>
                <Input
                  value={form.courseCodes}
                  onChange={(e) => setForm({ ...form, courseCodes: e.target.value })}
                  placeholder="CHEM12, PHYS12"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {(form.operator === "ANY_OF" || form.operator === "AT_LEAST_N") && (
                <div className="space-y-1.5">
                  <Label>Minimum grade (optional)</Label>
                  <Input
                    type="number"
                    value={form.minimumGrade}
                    onChange={(e) => setForm({ ...form, minimumGrade: e.target.value })}
                  />
                </div>
              )}
              {form.operator === "AT_LEAST_N" && (
                <div className="space-y-1.5">
                  <Label>N (how many required)</Label>
                  <Input type="number" value={form.n} onChange={(e) => setForm({ ...form, n: e.target.value })} />
                </div>
              )}
              {form.operator === "AVERAGE_OF_SELECTED" && (
                <div className="space-y-1.5">
                  <Label>Minimum average</Label>
                  <Input
                    type="number"
                    value={form.minimum}
                    onChange={(e) => setForm({ ...form, minimum: e.target.value })}
                  />
                </div>
              )}
            </div>

            {form.operator === "SUPPLEMENTAL_REQUIRED" && (
              <div className="space-y-1.5">
                <Label>Supplemental type</Label>
                <Select
                  value={form.supplementalType}
                  onValueChange={(v) => setForm({ ...form, supplementalType: v as FormState["supplementalType"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal_profile">Personal profile</SelectItem>
                    <SelectItem value="supplementary_application">Supplementary application</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="audition">Audition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.operator === "GRADUATION_REQUIREMENT" && (
              <div className="space-y-1.5">
                <Label>Description (optional)</Label>
                <Input
                  value={form.graduationDescription}
                  onChange={(e) => setForm({ ...form, graduationDescription: e.target.value })}
                />
              </div>
            )}

            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Preview</p>
              {preview}
            </div>

            <div className="space-y-1.5">
              <Label>Display text (shown to students)</Label>
              <Textarea
                rows={2}
                value={form.display_text}
                onChange={(e) => setForm({ ...form, display_text: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select
                  value={form.source_snapshot_id || "none"}
                  onValueChange={(v) => setForm({ ...form, source_snapshot_id: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No source yet</SelectItem>
                    {sources.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.page_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Trust status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as FormState["status"] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="needs_review">Needs review</SelectItem>
                    <SelectItem value="stale">Stale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Effective cycle</Label>
              <Input
                value={form.effective_cycle}
                onChange={(e) => setForm({ ...form, effective_cycle: e.target.value })}
              />
            </div>

            {form.status === "verified" && !form.source_snapshot_id && (
              <Badge variant="destructive">A verified requirement needs a source.</Badge>
            )}
          </div>
          <FormMessage error={error} />
          <DialogFooter>
            <Button onClick={save} disabled={pending || !form.display_text}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
