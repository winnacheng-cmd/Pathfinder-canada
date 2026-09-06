"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormMessage } from "@/components/FormMessage";
import { SourceLink } from "@/components/SourceLink";
import { upsertSourceAction } from "./actions";
import type { SourceSnapshot } from "@/types/database";

function emptyForm(): SourceSnapshot {
  return {
    id: "",
    source_url: "",
    official_domain: "",
    page_title: "",
    captured_text_excerpt: null,
    verified_by: null,
    verified_at: new Date().toISOString().slice(0, 10),
    expires_at: null,
    source_hash: null,
    notes: null,
    created_at: "",
  };
}

export function SourcesManager({ initial }: { initial: SourceSnapshot[] }) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SourceSnapshot>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyForm());
    setError(null);
    setOpen(true);
  }

  function openEdit(source: SourceSnapshot) {
    setForm(source);
    setError(null);
    setOpen(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertSourceAction({
        id: form.id || undefined,
        source_url: form.source_url,
        official_domain: form.official_domain,
        page_title: form.page_title,
        captured_text_excerpt: form.captured_text_excerpt || undefined,
        verified_by: form.verified_by || undefined,
        verified_at: form.verified_at,
        expires_at: form.expires_at || "",
        notes: form.notes || undefined,
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
        <h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Add source
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page title</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Link</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="font-medium">{source.page_title}</TableCell>
                <TableCell>{source.verified_at}</TableCell>
                <TableCell>{source.expires_at ?? "—"}</TableCell>
                <TableCell>
                  <SourceLink url={source.source_url} label="Open" />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(source)}>
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
            <DialogTitle>{form.id ? "Edit source" : "Add source"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Source URL</Label>
              <Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Official domain</Label>
                <Input
                  value={form.official_domain}
                  onChange={(e) => setForm({ ...form, official_domain: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Page title</Label>
                <Input value={form.page_title} onChange={(e) => setForm({ ...form, page_title: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Captured excerpt</Label>
              <Textarea
                rows={2}
                value={form.captured_text_excerpt ?? ""}
                onChange={(e) => setForm({ ...form, captured_text_excerpt: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Verified by</Label>
                <Input value={form.verified_by ?? ""} onChange={(e) => setForm({ ...form, verified_by: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Verified date</Label>
                <Input
                  type="date"
                  value={form.verified_at}
                  onChange={(e) => setForm({ ...form, verified_at: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Recheck / expires date</Label>
              <Input
                type="date"
                value={form.expires_at ?? ""}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <FormMessage error={error} />
          <DialogFooter>
            <Button onClick={save} disabled={pending || !form.source_url || !form.page_title || !form.verified_at}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
