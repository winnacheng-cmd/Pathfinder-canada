import { AlertTriangle, ArrowDown, Check, Circle, CircleDot, ClipboardList, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequirementEvaluationStatus } from "@/domain/eligibility/types";

// Icon + text + color per build-prompt §61 — never color alone.
const CONFIG: Record<
  RequirementEvaluationStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  met: { label: "Met", icon: Check, className: "text-success" },
  missing_course: { label: "Missing", icon: AlertTriangle, className: "text-destructive" },
  below_minimum: { label: "Below minimum", icon: ArrowDown, className: "text-destructive" },
  planned: { label: "Planned", icon: Circle, className: "text-muted-foreground" },
  in_progress: { label: "In progress", icon: CircleDot, className: "text-warning" },
  unknown_grade: { label: "Grade unknown", icon: HelpCircle, className: "text-muted-foreground" },
  supplemental_required: {
    label: "Not yet completed",
    icon: ClipboardList,
    className: "text-muted-foreground",
  },
  needs_review: { label: "Needs review", icon: HelpCircle, className: "text-muted-foreground" },
};

export function RequirementStatusIcon({
  status,
  className,
}: {
  status: RequirementEvaluationStatus;
  className?: string;
}) {
  const { label, icon: Icon, className: colorClass } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", colorClass, className)}>
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </span>
  );
}
