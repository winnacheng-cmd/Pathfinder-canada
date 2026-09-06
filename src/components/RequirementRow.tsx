import { RequirementStatusIcon } from "@/components/RequirementStatusIcon";
import { VerifiedSourceBadge } from "@/components/VerifiedSourceBadge";
import { StaleWarning } from "@/components/StaleWarning";
import { SourceLink } from "@/components/SourceLink";
import type { RequirementEvaluationResult } from "@/domain/eligibility/types";
import type { SourceSnapshot } from "@/types/database";

export function RequirementRow({
  requirement,
  source,
}: {
  requirement: RequirementEvaluationResult;
  source?: SourceSnapshot;
}) {
  const showValues =
    requirement.studentValue !== null && requirement.requiredValue !== null && typeof requirement.requiredValue === "number";

  return (
    <div className="space-y-2 rounded-md border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium">{requirement.displayText}</p>
        <VerifiedSourceBadge status={requirement.trustStatus} />
      </div>

      <RequirementStatusIcon status={requirement.status} />

      {showValues && (
        <p className="text-sm text-muted-foreground">
          Your value: {requirement.studentValue}% · Published minimum: {requirement.requiredValue}%
        </p>
      )}

      {requirement.ruleParseError && (
        <p className="text-xs text-destructive">
          This rule couldn&apos;t be evaluated ({requirement.ruleParseError}) — flagged for admin review.
        </p>
      )}

      {requirement.trustStatus !== "verified" && <StaleWarning />}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
        {source ? <SourceLink url={source.source_url} /> : <span>No source on file yet</span>}
        {source && <span>Verified {source.verified_at}</span>}
      </div>
    </div>
  );
}
