"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { upsertCourseAction } from "./actions";
import type { Course } from "@/types/database";

function emptyForm(): Course {
  return {
    id: "",
    province: "BC",
    curriculum: "BC Graduation Program",
    code: "",
    name: "",
    grade_level: "12",
    subject_group: "science",
    active: true,
    created_at: "",
    updated_at: "",
  };
}

export function CoursesManager({ initial }: { initial: Course[] }) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Course>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyForm());
    setError(null);
    setOpen(true);
  }

  function openEdit(course: Course) {
    setForm(course);
    setError(null);
    setOpen(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertCourseAction({
        id: form.id || undefined,
        province: form.province,
        curriculum: form.curriculum,
        code: form.code,
        name: form.name,
        grade_level: form.grade_level,
        subject_group: form.subject_group,
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
        <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Add course
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Subject group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-mono text-xs">{course.code}</TableCell>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell>{course.grade_level}</TableCell>
                <TableCell>{course.subject_group}</TableCell>
                <TableCell>
                  <Badge variant={course.active ? "secondary" : "outline"}>
                    {course.active ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(course)}>
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
            <DialogTitle>{form.id ? "Edit course" : "Add course"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-1.5">
                <Label>Grade level</Label>
                <Select
                  value={form.grade_level}
                  onValueChange={(grade_level) => setForm({ ...form, grade_level: grade_level as Course["grade_level"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="11">11</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                <Label>Subject group</Label>
                <Input
                  value={form.subject_group}
                  onChange={(e) => setForm({ ...form, subject_group: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Curriculum</Label>
              <Input value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} />
              <Label>Active</Label>
            </div>
          </div>
          <FormMessage error={error} />
          <DialogFooter>
            <Button onClick={save} disabled={pending || !form.code || !form.name}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
