"use client";

import { useState, useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormMessage } from "@/components/FormMessage";
import { subjectAreas } from "@/config/site";
import { deleteAccountAction, updateProfileAction } from "./actions";
import type { GradeLevel } from "@/types/database";

export function SettingsView({
  initialGradeLevel,
  initialGraduationYear,
  initialInterests,
  email,
}: {
  initialGradeLevel: GradeLevel;
  initialGraduationYear: number;
  initialInterests: string[];
  email: string;
}) {
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(initialGradeLevel);
  const [graduationYear, setGraduationYear] = useState(initialGraduationYear);
  const [interests, setInterests] = useState<string[]>(initialInterests);
  const [state, setState] = useState<{ error?: string; success?: string } | undefined>();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  function toggleInterest(area: string) {
    setInterests((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  function save() {
    setState(undefined);
    startTransition(async () => {
      const result = await updateProfileAction({ gradeLevel, graduationYear, interests });
      setState(result);
    });
  }

  function handleDelete() {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteAccountAction();
      if (result?.error) setDeleteError(result.error);
    });
  }

  return (
    <div className="max-w-xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">{email}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Profile</h2>
        <div className="space-y-1.5">
          <Label>Grade level</Label>
          <Select value={gradeLevel} onValueChange={(v) => setGradeLevel(v as GradeLevel)}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grade_11">Grade 11</SelectItem>
              <SelectItem value="grade_12">Grade 12</SelectItem>
              <SelectItem value="graduated_upgrading">Graduated / upgrading</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Expected graduation year</Label>
          <Input
            type="number"
            className="w-40"
            value={graduationYear}
            onChange={(e) => setGraduationYear(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Interests</Label>
          <div className="flex flex-wrap gap-2">
            {subjectAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleInterest(area)}
                aria-pressed={interests.includes(area)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  interests.includes(area)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
        <FormMessage error={state?.error} success={state?.success} />
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-medium">Your data</h2>
        <p className="text-sm text-muted-foreground">
          Download everything Pathfinder has about you — profile, courses, saved programs, and scenarios.
        </p>
        <Button variant="outline" asChild>
          <a href="/api/export" download="pathfinder-data.json">
            <Download className="size-4" />
            Export my data
          </a>
        </Button>
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <h2 className="text-lg font-medium text-destructive">Delete account</h2>
        <p className="text-sm text-muted-foreground">
          Permanently deletes your profile, courses, saved programs, and scenarios, and removes your
          login. This can&apos;t be undone.
        </p>
        <AlertDialog onOpenChange={(open) => !open && setDeleteConfirmText("")}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="size-4" />
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your academic profile and login. Type DELETE to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              aria-label="Type DELETE to confirm"
            />
            <FormMessage error={deleteError} />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteConfirmText !== "DELETE" || deletePending}
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deletePending ? "Deleting…" : "Permanently delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
