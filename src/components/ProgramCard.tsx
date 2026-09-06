import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { SaveProgramButton } from "@/features/programs/SaveProgramButton";
import type { ProgramEvaluationStatus } from "@/domain/eligibility/types";
import type { ProgramWithInstitution } from "@/lib/queries/programs";

export function ProgramCard({
  program,
  status,
  saved,
}: {
  program: ProgramWithInstitution;
  status?: ProgramEvaluationStatus;
  saved?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/programs/${program.id}`} className="font-medium hover:underline">
            {program.name}
          </Link>
          <Badge variant="secondary">{program.subject_area}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {program.institution.name} · {program.credential}
          {program.institution.city ? ` · ${program.institution.city}, ${program.institution.province}` : ""}
        </p>
        {status && <EligibilityBadge status={status} />}
      </div>
      {saved !== undefined && <SaveProgramButton programId={program.id} initiallySaved={saved} />}
    </div>
  );
}
