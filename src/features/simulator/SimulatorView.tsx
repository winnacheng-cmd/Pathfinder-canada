"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { RotateCcw, Save } from "lucide-react";
import { evaluateProgram } from "@/domain/eligibility/evaluate-program";
import { generateActionPlan } from "@/domain/recommendations/action-engine";
import { compareScenario, type ScenarioProgramSnapshot } from "@/domain/scenario/compare-scenario";
import { removeScenarioCourse } from "@/domain/scenario/apply-scenario";
import type { RequirementInput, StudentCourseInput } from "@/domain/eligibility/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseGradeInput } from "@/components/CourseGradeInput";
import { EligibilityBadge } from "@/components/EligibilityBadge";
import { FormMessage } from "@/components/FormMessage";
import { EmptyState } from "@/components/EmptyState";
import { FlaskConical } from "lucide-react";
import { saveScenarioAction } from "./actions";
import type { Course } from "@/types/database";

interface SimulatorProgram {
  programId: string;
  programName: string;
  requirements: RequirementInput[];
}

type ScenarioCourse = StudentCourseInput & { name: string };

export function SimulatorView({
  availableCourses,
  initialCourses,
  programs,
  courseNameByCode,
}: {
  availableCourses: Course[];
  initialCourses: ScenarioCourse[];
  programs: SimulatorProgram[];
  courseNameByCode: Record<string, string>;
}) {
  const [scenarioCourses, setScenarioCourses] = useState<ScenarioCourse[]>(initialCourses);
  const [query, setQuery] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [saveState, setSaveState] = useState<{ error?: string; success?: string } | undefined>();
  const [pending, startTransition] = useTransition();

  const baselineByProgram = useMemo(
    () =>
      programs.map((p) => ({
        programId: p.programId,
        programName: p.programName,
        status: evaluateProgram(p.programId, p.requirements, initialCourses).status,
      })),
    [programs, initialCourses]
  );

  const scenarioByProgram: ScenarioProgramSnapshot[] = useMemo(
    () =>
      programs.map((p) => ({
        programId: p.programId,
        programName: p.programName,
        status: evaluateProgram(p.programId, p.requirements, scenarioCourses).status,
      })),
    [programs, scenarioCourses]
  );

  const comparison = useMemo(
    () => compareScenario(baselineByProgram, scenarioByProgram),
    [baselineByProgram, scenarioByProgram]
  );

  const presetActions = useMemo(() => {
    const baselineEvaluations = programs.map((p) => ({
      programId: p.programId,
      programName: p.programName,
      evaluation: evaluateProgram(p.programId, p.requirements, initialCourses),
    }));
    return generateActionPlan(baselineEvaluations, [], courseNameByCode)
      .filter((a) => a.actionType === "add_course" || a.actionType === "improve_grade")
      .slice(0, 3);
  }, [programs, initialCourses, courseNameByCode]);

  const isDirty = JSON.stringify(scenarioCourses) !== JSON.stringify(initialCourses);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const present = new Set(scenarioCourses.map((c) => c.courseCode));
    return availableCourses
      .filter((c) => !present.has(c.code))
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 6);
  }, [availableCourses, query, scenarioCourses]);

  function applyPreset(action: (typeof presetActions)[number]) {
    if (!action.courseCode) return;
    if (action.actionType === "add_course") {
      const code = action.courseCode;
      setScenarioCourses((prev) => {
        if (prev.some((c) => c.courseCode === code)) return prev;
        return [
          ...prev,
          { courseCode: code, name: courseNameByCode[code] ?? code, status: "completed", gradePercent: null, predictedGradePercent: null },
        ];
      });
    } else if (action.actionType === "improve_grade" && action.targetGrade) {
      setScenarioCourses((prev) =>
        prev.map((c) =>
          c.courseCode === action.courseCode ? { ...c, gradePercent: action.targetGrade! } : c
        )
      );
    }
  }

  function addCourse(course: Course) {
    setScenarioCourses((prev) => [
      ...prev,
      { courseCode: course.code, name: course.name, status: "completed", gradePercent: null, predictedGradePercent: null },
    ]);
    setQuery("");
  }

  function removeCourse(courseCode: string) {
    setScenarioCourses((prev) => removeScenarioCourse(prev, courseCode) as ScenarioCourse[]);
  }

  function updateCourse(courseCode: string, patch: Partial<ScenarioCourse>) {
    setScenarioCourses((prev) =>
      prev.map((c) => (c.courseCode === courseCode ? { ...c, ...patch } : c))
    );
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveScenarioAction({
        name: scenarioName || "Untitled scenario",
        scenarioJson: {
          courses: scenarioCourses.map(({ courseCode, status, gradePercent, predictedGradePercent }) => ({
            courseCode,
            status,
            gradePercent,
            predictedGradePercent,
          })),
        },
      });
      setSaveState(result);
      if (!result?.error) {
        setSaveOpen(false);
        setScenarioName("");
      }
    });
  }

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="Save a target program first"
        description="The what-if simulator compares your saved programs before and after a hypothetical change."
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your scenario</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setScenarioCourses(initialCourses)} disabled={!isDirty}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button size="sm" onClick={() => setSaveOpen(true)} disabled={!isDirty}>
              <Save className="size-4" />
              Save scenario
            </Button>
          </div>
        </div>

        {presetActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {presetActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => applyPreset(action)}
                className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                What if {courseNameByCode[action.courseCode ?? ""] ?? action.courseCode}
                {action.actionType === "improve_grade" ? ` = ${action.targetGrade}%?` : "?"}
              </button>
            ))}
          </div>
        )}

        <Input
          placeholder="Add a course to this scenario"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {matches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {matches.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => addCourse(course)}
                className="rounded-full border border-border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                + {course.name}
              </button>
            ))}
          </div>
        )}

        <ul className="space-y-2">
          {scenarioCourses.map((c) => (
            <li
              key={c.courseCode}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
            >
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-2">
                <CourseGradeInput
                  status={c.status}
                  gradePercent={c.gradePercent ?? null}
                  predictedGradePercent={c.predictedGradePercent ?? null}
                  onStatusChange={(status) => updateCourse(c.courseCode, { status })}
                  onGradeChange={(gradePercent) => updateCourse(c.courseCode, { gradePercent })}
                  onPredictedGradeChange={(predictedGradePercent) =>
                    updateCourse(c.courseCode, { predictedGradePercent })
                  }
                />
                <Button variant="ghost" size="sm" onClick={() => removeCourse(c.courseCode)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">What changes</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Before</p>
            <p className="text-2xl font-semibold tabular-nums">
              {comparison.before.eligible}
              <span className="text-base font-normal text-muted-foreground"> / {comparison.before.total} eligible</span>
            </p>
          </div>
          <div className="rounded-lg border border-primary p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">After</p>
            <p className="text-2xl font-semibold tabular-nums">
              {comparison.after.eligible}
              <span className="text-base font-normal text-muted-foreground"> / {comparison.after.total} eligible</span>
            </p>
          </div>
        </div>

        {(["newly_opened", "lost", "still_missing", "unchanged"] as const).map((diff) => {
          const items = comparison.programs.filter((p) => p.diff === diff);
          if (items.length === 0) return null;
          const labels: Record<typeof diff, string> = {
            newly_opened: "Newly opened",
            lost: "Lost",
            still_missing: "Still unavailable",
            unchanged: "Unchanged",
          };
          return (
            <div key={diff} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{labels[diff]}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li
                    key={item.programId}
                    className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm"
                  >
                    <Link href={`/programs/${item.programId}`} className="hover:underline">
                      {item.programName}
                    </Link>
                    <EligibilityBadge status={item.status} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Name</Label>
            <Input
              id="scenario-name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g. If Pre-Calc reaches 90%"
            />
          </div>
          <FormMessage error={saveState?.error} success={saveState?.success} />
          <DialogFooter>
            <Button onClick={handleSave} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
