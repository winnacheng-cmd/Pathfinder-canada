import { AlertTriangle, CheckCircle2, CircleDot, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgramEvaluationStatus } from "@/domain/eligibility/types";

const CONFIG: Record<
  ProgramEvaluationStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  eligible: {
    label: "Eligible",
    icon: CheckCircle2,
    className: "bg-success/10 text-success",
  },
  conditionally_eligible: {
    label: "Conditionally eligible",
    icon: CircleDot,
    className: "bg-warning/10 text-warning",
  },
  missing_requirements: {
    label: "Missing requirements",
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive",
  },
  needs_review: {
    label: "Needs review",
    icon: HelpCircle,
    className: "bg-muted text-muted-foreground",
  },
};

export function EligibilityBadge({ status }: { status: ProgramEvaluationStatus }) {
  const { label, icon: Icon, className } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
