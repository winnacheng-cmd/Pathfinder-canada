"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ExplainPanel() {
  const [state, setState] = useState<
    { status: "idle" } | { status: "loading" } | { status: "error" } | { status: "done"; text: string; source: "ai" | "fallback" }
  >({ status: "idle" });

  async function handleExplain() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/explain", { method: "POST" });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { explanation: string; source: "ai" | "fallback" };
      setState({ status: "done", text: data.explanation, source: data.source });
    } catch {
      setState({ status: "error" });
    }
  }

  if (state.status === "idle") {
    return (
      <Button variant="outline" size="sm" onClick={handleExplain}>
        <Sparkles className="size-4" />
        Explain this
      </Button>
    );
  }

  return (
    <Card className="space-y-2 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        Explanation
      </div>
      {state.status === "loading" && <p className="text-sm text-muted-foreground">Thinking…</p>}
      {state.status === "error" && (
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t generate an explanation right now — the structured results above are still accurate.
        </p>
      )}
      {state.status === "done" && (
        <>
          <p className="text-sm">{state.text}</p>
          <p className="text-xs text-muted-foreground">
            {state.source === "ai"
              ? "AI-generated summary of the results above — the results themselves are computed by rules, not AI."
              : "Generated from the structured results above (no AI configured)."}
          </p>
        </>
      )}
    </Card>
  );
}
