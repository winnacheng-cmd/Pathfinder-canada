import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getStudentCoursesWithInfo } from "@/lib/queries/student-courses";

export const dynamic = "force-dynamic";

/**
 * Returns the student's own data as JSON — profile, courses, saved
 * programs, scenarios. Deliberately excludes internal admin fields
 * (audit logs, other users' feedback, etc). See docs/PRIVACY.md "Data export".
 */
export async function GET() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) {
    return NextResponse.json({ error: "Complete onboarding first." }, { status: 401 });
  }

  const supabase = await createClient();
  const [courses, { data: savedPrograms }, { data: scenarios }] = await Promise.all([
    getStudentCoursesWithInfo(profile.id),
    supabase.from("saved_programs").select("program_id, created_at").eq("student_profile_id", profile.id),
    supabase.from("scenarios").select("name, scenario_json, created_at").eq("student_profile_id", profile.id),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      province: profile.province,
      curriculum: profile.curriculum,
      gradeLevel: profile.grade_level,
      graduationYear: profile.graduation_year,
      interests: profile.interests,
    },
    courses: courses.map((c) => ({
      code: c.code,
      name: c.name,
      status: c.status,
      gradePercent: c.gradePercent,
      predictedGradePercent: c.predictedGradePercent,
    })),
    savedPrograms: savedPrograms ?? [],
    scenarios: scenarios ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": 'attachment; filename="pathfinder-data.json"',
    },
  });
}
