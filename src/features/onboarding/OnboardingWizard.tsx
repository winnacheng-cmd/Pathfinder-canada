"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressStepper } from "@/components/ProgressStepper";
import { CourseGradeInput } from "@/components/CourseGradeInput";
import { FormMessage } from "@/components/FormMessage";
import { subjectAreas } from "@/config/site";
import { onboardingSchema } from "@/lib/validation/onboarding";
import { completeOnboardingAction } from "./actions";
import type { CourseStatus } from "@/types/database";
import type { ProgramWithInstitution } from "@/lib/queries/catalog";
import type { Course } from "@/types/database";

const STEPS = ["Location", "Grade", "Grad year", "Courses", "Interests", "Target programs"];

type WizardCourse = {
  courseId: string;
  code: string;
  name: string;
  status: CourseStatus;
  gradePercent: number | null;
  predictedGradePercent: number | null;
};

export function OnboardingWizard({
  availableCourses,
  availablePrograms,
}: {
  availableCourses: Course[];
  availablePrograms: ProgramWithInstitution[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [gradeLevel, setGradeLevel] = useState<"grade_11" | "grade_12" | "graduated_upgrading" | "">("");
  const [graduationYear, setGraduationYear] = useState<number | "">("");
  const [interests, setInterests] = useState<string[]>([]);
  const [courses, setCourses] = useState<WizardCourse[]>([]);
  const [courseQuery, setCourseQuery] = useState("");
  const [savedProgramIds, setSavedProgramIds] = useState<string[]>([]);
  const [programQuery, setProgramQuery] = useState("");

  const courseMatches = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    const selected = new Set(courses.map((c) => c.courseId));
    return availableCourses
      .filter((c) => !selected.has(c.id))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 8);
  }, [availableCourses, courseQuery, courses]);

  const programMatches = useMemo(() => {
    const q = programQuery.trim().toLowerCase();
    if (!q) return availablePrograms.slice(0, 8);
    return availablePrograms
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.institution.name.toLowerCase().includes(q) ||
          p.subject_area.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [availablePrograms, programQuery]);

  function addCourse(course: Course) {
    setCourses((prev) => [
      ...prev,
      {
        courseId: course.id,
        code: course.code,
        name: course.name,
        status: "completed",
        gradePercent: null,
        predictedGradePercent: null,
      },
    ]);
  }

  function removeCourse(courseId: string) {
    setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
  }

  function updateCourse(courseId: string, patch: Partial<WizardCourse>) {
    setCourses((prev) => prev.map((c) => (c.courseId === courseId ? { ...c, ...patch } : c)));
  }

  function toggleInterest(area: string) {
    setInterests((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  function toggleProgram(programId: string) {
    setSavedProgramIds((prev) =>
      prev.includes(programId) ? prev.filter((id) => id !== programId) : [...prev, programId]
    );
  }

  function canAdvance(): boolean {
    if (step === 1) return gradeLevel !== "";
    if (step === 2) return graduationYear !== "" && Number(graduationYear) >= 2020;
    return true;
  }

  function handleFinish() {
    setError(null);
    const payload = {
      province: "BC",
      curriculum: "BC Graduation Program",
      gradeLevel,
      graduationYear: Number(graduationYear),
      interests,
      courses: courses.map((c) => ({
        courseId: c.courseId,
        status: c.status,
        gradePercent: c.status === "planned" ? null : c.gradePercent,
        predictedGradePercent: c.status === "in_progress" ? c.predictedGradePercent : null,
      })),
      savedProgramIds,
    };

    const parsed = onboardingSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your answers.");
      return;
    }

    startTransition(async () => {
      const result = await completeOnboardingAction(parsed.data);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    });
  }

  return (
    <div className="space-y-8">
      <ProgressStepper steps={STEPS} currentStep={step} />

      {step === 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Where do you study?</h2>
          <div className="space-y-2">
            <Label>Province</Label>
            <Select defaultValue="BC" disabled>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BC">British Columbia</SelectItem>
                <SelectItem value="ON" disabled>
                  Ontario (coming soon)
                </SelectItem>
                <SelectItem value="AB" disabled>
                  Alberta (coming soon)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Curriculum: BC Graduation Program. More provinces are on the roadmap — see docs/ROADMAP.md.
            </p>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">What grade are you in?</h2>
          <RadioGroup value={gradeLevel} onValueChange={(v) => setGradeLevel(v as typeof gradeLevel)}>
            {[
              { value: "grade_11", label: "Grade 11" },
              { value: "grade_12", label: "Grade 12" },
              { value: "graduated_upgrading", label: "Graduated / upgrading" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer has-[[data-state=checked]]:border-primary"
              >
                <RadioGroupItem value={opt.value} id={opt.value} />
                <span>{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Expected graduation year</h2>
          <Input
            type="number"
            className="w-40"
            min={2020}
            max={2100}
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Add your courses</h2>
          <p className="text-sm text-muted-foreground">
            Search and add the courses you&apos;ve completed, are taking, or plan to take. Skip the grade if
            you don&apos;t know it yet.
          </p>
          <Input
            placeholder="Search courses (e.g. Chemistry, PREC12)"
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
          />
          {courseQuery && (
            <div className="flex flex-wrap gap-2">
              {courseMatches.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    addCourse(course);
                    setCourseQuery("");
                  }}
                  className="rounded-full border border-border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  + {course.name}
                </button>
              ))}
              {courseMatches.length === 0 && (
                <p className="text-sm text-muted-foreground">No matching courses.</p>
              )}
            </div>
          )}

          <ul className="space-y-2">
            {courses.map((c) => (
              <li
                key={c.courseId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <span className="font-medium">{c.name}</span>
                <div className="flex items-center gap-2">
                  <CourseGradeInput
                    status={c.status}
                    gradePercent={c.gradePercent}
                    predictedGradePercent={c.predictedGradePercent}
                    onStatusChange={(status) => updateCourse(c.courseId, { status })}
                    onGradeChange={(gradePercent) => updateCourse(c.courseId, { gradePercent })}
                    onPredictedGradeChange={(predictedGradePercent) =>
                      updateCourse(c.courseId, { predictedGradePercent })
                    }
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeCourse(c.courseId)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses added yet.</p>
            )}
          </ul>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">What are you interested in?</h2>
          <p className="text-sm text-muted-foreground">Optional — pick as many as apply.</p>
          <div className="flex flex-wrap gap-2">
            {subjectAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleInterest(area)}
                aria-pressed={interests.includes(area)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  interests.includes(area)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Target programs</h2>
          <p className="text-sm text-muted-foreground">
            Save a few programs you&apos;re considering — you can add more anytime.{" "}
            {savedProgramIds.length > 0 && (
              <Badge variant="secondary">{savedProgramIds.length} saved</Badge>
            )}
          </p>
          <Input
            placeholder="Search programs, institutions, or subjects"
            value={programQuery}
            onChange={(e) => setProgramQuery(e.target.value)}
          />
          <ul className="space-y-2">
            {programMatches.map((program) => {
              const saved = savedProgramIds.includes(program.id);
              return (
                <li
                  key={program.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {program.institution.name} · {program.credential}
                    </p>
                  </div>
                  <Button
                    variant={saved ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleProgram(program.id)}
                  >
                    {saved ? "Saved" : "Save"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <FormMessage error={error} />

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={pending}>
            {pending ? "Saving…" : "Finish"}
          </Button>
        )}
      </div>
    </div>
  );
}
