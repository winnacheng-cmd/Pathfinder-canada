import type { Metadata } from "next";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getCourses } from "@/lib/queries/catalog";
import { getStudentCoursesWithInfo } from "@/lib/queries/student-courses";
import { CoursesEditor } from "@/features/courses/CoursesEditor";

export const metadata: Metadata = { title: "My Courses" };
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return null;

  const [availableCourses, studentCourses] = await Promise.all([
    getCourses(profile.province, profile.curriculum),
    getStudentCoursesWithInfo(profile.id),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">
          Keep this up to date — every eligibility result and action on Pathfinder is computed from
          what&apos;s here.
        </p>
      </div>
      <CoursesEditor availableCourses={availableCourses} initialStudentCourses={studentCourses} />
    </div>
  );
}
