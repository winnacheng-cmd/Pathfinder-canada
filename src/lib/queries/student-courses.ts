import "server-only";
import { createClient } from "@/lib/supabase/server";
import { toStudentCourseInputs } from "@/domain/adapters";
import type { StudentCourseInput } from "@/domain/eligibility/types";
import type { Course, StudentCourse } from "@/types/database";

export async function getStudentCourseRows(studentProfileId: string): Promise<StudentCourse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_courses")
    .select("*")
    .eq("student_profile_id", studentProfileId);
  if (error) throw error;
  return data ?? [];
}

export interface StudentCourseWithInfo {
  studentCourseId: string;
  courseId: string;
  code: string;
  name: string;
  status: StudentCourse["status"];
  gradePercent: number | null;
  predictedGradePercent: number | null;
}

/** Joined view for the My Courses editor UI — includes course name/code, not just the domain shape. */
export async function getStudentCoursesWithInfo(studentProfileId: string): Promise<StudentCourseWithInfo[]> {
  const supabase = await createClient();
  const [{ data: studentCourses, error: scError }, { data: allCourses, error: cError }] =
    await Promise.all([
      supabase.from("student_courses").select("*").eq("student_profile_id", studentProfileId),
      supabase.from("courses").select("*"),
    ]);
  if (scError) throw scError;
  if (cError) throw cError;

  const courseById = new Map((allCourses ?? []).map((c) => [c.id, c as Course]));
  const result: StudentCourseWithInfo[] = [];
  for (const sc of (studentCourses ?? []) as StudentCourse[]) {
    const course = courseById.get(sc.course_id);
    if (!course) continue;
    result.push({
      studentCourseId: sc.id,
      courseId: course.id,
      code: course.code,
      name: course.name,
      status: sc.status,
      gradePercent: sc.grade_percent,
      predictedGradePercent: sc.predicted_grade_percent,
    });
  }
  return result;
}

/** Fetches a student's courses already mapped into the domain engine's input shape. */
export async function getStudentCourseInputs(studentProfileId: string): Promise<StudentCourseInput[]> {
  const supabase = await createClient();
  const [{ data: studentCourses, error: scError }, { data: allCourses, error: cError }] =
    await Promise.all([
      supabase.from("student_courses").select("*").eq("student_profile_id", studentProfileId),
      supabase.from("courses").select("*"),
    ]);
  if (scError) throw scError;
  if (cError) throw cError;
  return toStudentCourseInputs((studentCourses ?? []) as StudentCourse[], (allCourses ?? []) as Course[]);
}
