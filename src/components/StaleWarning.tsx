import { AlertTriangle } from "lucide-react";

export function StaleWarning() {
  return (
    <p className="flex items-start gap-1.5 text-xs text-warning">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      This requirement needs re-verification before you rely on it.
    </p>
  );
}
