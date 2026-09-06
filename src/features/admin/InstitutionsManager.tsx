"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormMessage } from "@/components/FormMessage";
import { upsertInstitutionAction } from "./actions";
import type { Institution } from "@/types/database";

const EMPTY: Institution = {
  id: "",
  name: "",
  province: "BC",
  city: "",
  country: "Canada",
  official_url: "",
  logo_url: null,
  active: true,
  created_at: "",
  updated_at: "",
};

export function InstitutionsManager({ initial }: { initial: Institution[] }) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(EMPTY);
    setError(null);
    setOpen(true);
  }

  function openEdit(inst: Institution) {
    setForm(inst);
    setError(null);
    setOpen(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertInstitutionAction({
        id: form.id || undefined,
        name: form.name,
        province: form.province,
        city: form.city || undefined,
        country: form.country,
        official_url: form.official_url,
        active: form.active,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setRows((prev) => {
        const exists = prev.some((r) => r.id === form.id);
        if (exists) return prev.map((r) => (r.id === form.id ? { ...r, ...form } : r));
        return [...prev, { ...form, id: form.id || crypto.randomUUID() }];
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Institutions</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Add institution
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Official URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">{inst.name}</TableCell>
                <TableCell>
                  {inst.city ? `${inst.city}, ` : ""}
                  {inst.province}
                </TableCell>
                <TableCell className="max-w-[220px] truncate">{inst.official_url}</TableCell>
                <TableCell>
                  <Badge variant={inst.active ? "secondary" : "outline"}>
                    {inst.active ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(inst)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit institution" : "Add institution"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Province</Label>
                <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Official admissions URL</Label>
              <Input
                value={form.official_url}
                onChange={(e) => setForm({ ...form, official_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} />
              <Label>Active</Label>
            </div>
          </div>
          <FormMessage error={error} />
          <DialogFooter>
            <Button onClick={save} disabled={pending || !form.name || !form.official_url}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
