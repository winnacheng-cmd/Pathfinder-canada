"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/FormMessage";

export function UpgradeButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleUpgrade() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Couldn't start checkout.");
    } catch {
      setError("Couldn't start checkout.");
    }
    setPending(false);
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={handleUpgrade} disabled={pending}>
        {pending ? "Starting checkout…" : "Upgrade — CAD $39"}
      </Button>
      <FormMessage error={error} />
    </div>
  );
}
