"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/FormMessage";

export function RequestResetForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, undefined);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
    </form>
  );
}
