"use client";

import { useActionState } from "react";
import { signUpAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/FormMessage";

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, undefined);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          At least 8 characters.
        </p>
      </div>
      <FormMessage error={state?.error} success={state?.success} />
      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      <p className="text-xs text-muted-foreground text-center">
        By continuing you agree this is a student-owned academic planning tool — see{" "}
        <a href="/privacy" className="underline underline-offset-2">
          Privacy
        </a>{" "}
        and{" "}
        <a href="/terms" className="underline underline-offset-2">
          Terms
        </a>
        .
      </p>
    </form>
  );
}
