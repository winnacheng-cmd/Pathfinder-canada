"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { subjectAreas } from "@/config/site";
import { upsertProgramAction } from "./actions";
import type { Institution, Program } from "@/types/database";
import type { ProgramWithInstitutionName } from "@/lib/queries/admin-catalog";

function emptyForm(institutionId: string): Program {
  return {
    id: "",
    institution_id: institutionId,
    name: "",
    credential: "",
    faculty: null,
    campus: null,
    subject_area: "Undecided",
    intake_year: new Date().getFullYear() + 1,
    application_url: null,
    description: null,
    active: true,
    created_at: "",
    updated_at: "",
  };
}

export function ProgramsManager({
  initial,
  institutions,
}: {
  initial: ProgramWithInstitutionName[];
  institutions: Institution[];
}) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Program>(emptyForm(institutions[0]?.id ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyForm(institutions[0]?.id ?? ""));
    setError(null);
    setOpen(true);
  }

  function openEdit(program: ProgramWithInstitutionName) {
    setForm(program);
    setError(null);
    setOpen(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertProgramAction({
        id: form.id || undefined,
        institution_id: form.institution_id,
        name: form.name,
        credential: form.credential,
        faculty: form.faculty || undefined,
        campus: form.campus || undefined,
        subject_area: form.subject_area,
        intake_year: form.intake_year,
        application_url: form.application_url || "",
        description: form.description || undefined,
        active: form.active,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      const institutionName = institutions.find((i) => i.id === form.institution_id)?.name ?? "—";
      setRows((prev) => {
        const exists = prev.some((r) => r.id === form.id);
        if (exists) return prev.map((r) => (r.id === form.id ? { ...r, ...form, institutionName } : r));
        return [...prev, { ...form, id: form.id || crypto.randomUUID(), institutionName }];
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Programs</h1>
        <Button size="sm" onClick={openCreate} disabled={institutions.length === 0}>
          <Plus className="size-4" />
          Add program
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Subject area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((program) => (
              <TableRow key={program.id}>
                <TableCell className="font-medium">{program.name}</TableCell>
                <TableCell>{program.institutionName}</TableCell>
                <TableCell>{program.subject_area}</TableCell>
                <TableCell>
                  <Badge variant={program.active ? "secondary" : "outline"}>
                    {program.active ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(program)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit program" : "Add program"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Institution</Label>
              <Select
                value={form.institution_id}
                onValueChange={(institution_id) => setForm({ ...form, institution_id })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Program name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Credential</Label>
                <Input
                  value={form.credential}
                  onChange={(e) => setForm({ ...form, credential: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subject area</Label>
                <Select
                  value={form.subject_area}
                  onValueChange={(subject_area) =>
                    setForm({ ...form, subject_area: subject_area as Program["subject_area"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Faculty</Label>
                <Input value={form.faculty ?? ""} onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Campus</Label>
                <Input value={form.campus ?? ""} onChange={(e) => setForm({ ...form, campus: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Intake year</Label>
                <Input
                  type="number"
                  value={form.intake_year}
                  onChange={(e) => setForm({ ...form, intake_year: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Application URL</Label>
                <Input
                  value={form.application_url ?? ""}
                  onChange={(e) => setForm({ ...form, application_url: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} />
              <Label>Active</Label>
            </div>
          </div>
          <FormMessage error={error} />
          <DialogFooter>
            <Button onClick={save} disabled={pending || !form.name || !form.credential}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
