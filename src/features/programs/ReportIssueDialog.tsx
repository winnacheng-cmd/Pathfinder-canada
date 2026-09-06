"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/FormMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { submitFeedbackAction } from "./actions";

const OPTIONS = [
  { value: "incorrect_requirement", label: "Requirement incorrect" },
  { value: "stale_source", label: "Requirement outdated" },
  { value: "confusing", label: "Confusing" },
  { value: "other", label: "Other" },
];

export function ReportIssueDialog({ programId }: { programId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(submitFeedbackAction, undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="size-4" />
          Report an issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What&apos;s wrong?</DialogTitle>
          <DialogDescription>
            Help keep this data trustworthy — an admin reviews every report.
          </DialogDescription>
        </DialogHeader>
        {state?.success ? (
          <FormMessage success={state.success} />
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="programId" value={programId} />
            <RadioGroup name="feedbackType" defaultValue="incorrect_requirement" required>
              {OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="body">Details (optional)</Label>
              <Textarea id="body" name="body" rows={3} />
            </div>
            <FormMessage error={state?.error} />
            <SubmitButton pendingText="Submitting…">Submit report</SubmitButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
