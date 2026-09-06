"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgramCard } from "@/components/ProgramCard";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import type { ProgramEvaluationResult } from "@/domain/eligibility/types";
import type { ProgramWithInstitution } from "@/lib/queries/programs";

export interface EvaluatedSavedProgram {
  program: ProgramWithInstitution;
  evaluation: ProgramEvaluationResult;
  supplementalCount: number;
}

const MAX_COMPARE = 4;

export function TargetsView({ items }: { items: EvaluatedSavedProgram[] }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  function toggleCompare(programId: string) {
    setCompareIds((prev) => {
      if (prev.includes(programId)) return prev.filter((id) => id !== programId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, programId];
    });
  }

  const compared = items.filter((i) => compareIds.includes(i.program.id));

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {items.map(({ program, evaluation }) => (
          <li key={program.id} className="flex items-start gap-3">
            <Checkbox
              className="mt-4"
              checked={compareIds.includes(program.id)}
              onCheckedChange={() => toggleCompare(program.id)}
              disabled={!compareIds.includes(program.id) && compareIds.length >= MAX_COMPARE}
              aria-label={`Compare ${program.name}`}
            />
            <div className="flex-1">
              <ProgramCard program={program} status={evaluation.status} saved />
            </div>
          </li>
        ))}
      </ul>

      {compared.length >= 2 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">Comparing {compared.length} programs</h2>
            <Badge variant="secondary">up to {MAX_COMPARE}</Badge>
          </div>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Missing / attention</TableHead>
                  <TableHead>Supplemental items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compared.map(({ program, evaluation, supplementalCount }) => {
                  const attention = evaluation.requirements.filter(
                    (r) => r.status !== "met" && r.status !== "supplemental_required"
                  );
                  return (
                    <TableRow key={program.id}>
                      <TableCell className="min-w-[180px]">
                        <p className="font-medium">{program.name}</p>
                        <p className="text-sm text-muted-foreground">{program.institution.name}</p>
                      </TableCell>
                      <TableCell>
                        <EligibilityBadge status={evaluation.status} />
                      </TableCell>
                      <TableCell className="min-w-[220px] text-sm">
                        {attention.length === 0
                          ? "None"
                          : attention.map((r) => r.displayText).join("; ")}
                      </TableCell>
                      <TableCell>{supplementalCount}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}
    </div>
  );
}
