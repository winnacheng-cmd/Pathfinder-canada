"use client";

import { useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseGradeInput } from "@/components/CourseGradeInput";
import { FormMessage } from "@/components/FormMessage";
import { EmptyState } from "@/components/EmptyState";
import { BookOpen } from "lucide-react";
import {
  addStudentCourseAction,
  removeStudentCourseAction,
  updateStudentCourseAction,
} from "./actions";
import type { StudentCourseWithInfo } from "@/lib/queries/student-courses";
import type { Course, CourseStatus } from "@/types/database";

export function CoursesEditor({
  availableCourses,
  initialStudentCourses,
}: {
  availableCourses: Course[];
  initialStudentCourses: StudentCourseWithInfo[];
}) {
  const [studentCourses, setStudentCourses] = useState(initialStudentCourses);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const selected = new Set(studentCourses.map((c) => c.courseId));
    return availableCourses
      .filter((c) => !selected.has(c.id))
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 8);
  }, [availableCourses, query, studentCourses]);

  function handleAdd(course: Course) {
    setError(null);
    const optimistic: StudentCourseWithInfo = {
      studentCourseId: `pending-${course.id}`,
      courseId: course.id,
      code: course.code,
      name: course.name,
      status: "completed",
      gradePercent: null,
      predictedGradePercent: null,
    };
    setStudentCourses((prev) => [...prev, optimistic]);
    setQuery("");

    startTransition(async () => {
      const result = await addStudentCourseAction({
        courseId: course.id,
        status: "completed",
        gradePercent: null,
        predictedGradePercent: null,
      });
      if (result?.error) {
        setError(result.error);
        setStudentCourses((prev) => prev.filter((c) => c.studentCourseId !== optimistic.studentCourseId));
      }
    });
  }

  function handleUpdate(studentCourseId: string, patch: Partial<StudentCourseWithInfo>) {
    setStudentCourses((prev) =>
      prev.map((c) => (c.studentCourseId === studentCourseId ? { ...c, ...patch } : c))
    );
    const updated = { ...studentCourses.find((c) => c.studentCourseId === studentCourseId), ...patch };
    startTransition(async () => {
      const result = await updateStudentCourseAction(studentCourseId, {
        status: updated.status as CourseStatus,
        gradePercent: updated.status === "planned" ? null : (updated.gradePercent ?? null),
        predictedGradePercent: updated.status === "in_progress" ? (updated.predictedGradePercent ?? null) : null,
      });
      if (result?.error) setError(result.error);
    });
  }

  function handleRemove(studentCourseId: string) {
    const prevState = studentCourses;
    setStudentCourses((prev) => prev.filter((c) => c.studentCourseId !== studentCourseId));
    startTransition(async () => {
      const result = await removeStudentCourseAction(studentCourseId);
      if (result?.error) {
        setError(result.error);
        setStudentCourses(prevState);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Input
          placeholder="Search courses to add (e.g. Chemistry, PREC12)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {matches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {matches.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => handleAdd(course)}
                className="rounded-full border border-border px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                + {course.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <FormMessage error={error} />

      {studentCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Tell us what you're taking"
          description="Search above to add your completed, in-progress, and planned courses."
        />
      ) : (
        <ul className="space-y-2">
          {studentCourses.map((c) => (
            <li
              key={c.studentCourseId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
            >
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-2">
                <CourseGradeInput
                  status={c.status}
                  gradePercent={c.gradePercent}
                  predictedGradePercent={c.predictedGradePercent}
                  onStatusChange={(status) => handleUpdate(c.studentCourseId, { status })}
                  onGradeChange={(gradePercent) => handleUpdate(c.studentCourseId, { gradePercent })}
                  onPredictedGradeChange={(predictedGradePercent) =>
                    handleUpdate(c.studentCourseId, { predictedGradePercent })
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => handleRemove(c.studentCourseId)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
