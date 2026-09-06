import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequirementTrustStatus } from "@/types/database";

const CONFIG: Record<
  RequirementTrustStatus,
  { label: string; icon: typeof ShieldCheck; className: string }
> = {
  verified: { label: "VERIFIED", icon: ShieldCheck, className: "bg-success/10 text-success" },
  needs_review: {
    label: "NEEDS REVIEW",
    icon: ShieldQuestion,
    className: "bg-warning/10 text-warning",
  },
  stale: { label: "STALE", icon: ShieldAlert, className: "bg-destructive/10 text-destructive" },
};

export function VerifiedSourceBadge({ status }: { status: RequirementTrustStatus }) {
  const { label, icon: Icon, className } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
