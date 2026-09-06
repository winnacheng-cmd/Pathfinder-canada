"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CourseStatus } from "@/types/database";

const STATUS_LABELS: Record<CourseStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  planned: "Planned",
};

/** Status + grade pair reused by onboarding and the My Courses editor. */
export function CourseGradeInput({
  status,
  gradePercent,
  predictedGradePercent,
  onStatusChange,
  onGradeChange,
  onPredictedGradeChange,
}: {
  status: CourseStatus;
  gradePercent: number | null;
  predictedGradePercent: number | null;
  onStatusChange: (status: CourseStatus) => void;
  onGradeChange: (grade: number | null) => void;
  onPredictedGradeChange: (grade: number | null) => void;
}) {
  const showActualGrade = status === "completed";
  const showPredictedGrade = status === "in_progress";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(v) => onStatusChange(v as CourseStatus)}>
        <SelectTrigger className="w-36" aria-label="Course status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABELS) as CourseStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showActualGrade && (
        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Grade %"
          className="w-28"
          aria-label="Grade percent"
          value={gradePercent ?? ""}
          onChange={(e) => onGradeChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )}
      {showPredictedGrade && (
        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Predicted % (optional)"
          className="w-40"
          aria-label="Predicted grade percent"
          value={predictedGradePercent ?? ""}
          onChange={(e) =>
            onPredictedGradeChange(e.target.value === "" ? null : Number(e.target.value))
          }
        />
      )}
    </div>
  );
}
