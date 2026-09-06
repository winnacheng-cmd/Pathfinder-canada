import type { Metadata } from "next";
import { toRequirementInputs } from "@/domain/adapters";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getCourses } from "@/lib/queries/catalog";
import { getStudentCoursesWithInfo } from "@/lib/queries/student-courses";
import { getSavedProgramsWithDetails } from "@/lib/queries/programs";
import { SimulatorView } from "@/features/simulator/SimulatorView";

export const metadata: Metadata = { title: "What-If Simulator" };
export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const { profile } = await getCurrentUserAndProfile();
  if (!profile) return null;

  const [availableCourses, studentCourses, { programs, requirementsByProgram }] = await Promise.all([
    getCourses(profile.province, profile.curriculum),
    getStudentCoursesWithInfo(profile.id),
    getSavedProgramsWithDetails(profile.id),
  ]);

  const courseNameByCode = Object.fromEntries(availableCourses.map((c) => [c.code, c.name]));

  const initialCourses = studentCourses.map((c) => ({
    courseCode: c.code,
    name: c.name,
    status: c.status,
    gradePercent: c.gradePercent,
    predictedGradePercent: c.predictedGradePercent,
  }));

  const simulatorPrograms = programs.map((p) => ({
    programId: p.id,
    programName: p.name,
    requirements: toRequirementInputs(requirementsByProgram[p.id] ?? []),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">What-If Simulator</h1>
        <p className="text-muted-foreground">
          Test a change before you make it. Nothing here touches your real profile until you save it.
        </p>
      </div>
      <SimulatorView
        availableCourses={availableCourses}
        initialCourses={initialCourses}
        programs={simulatorPrograms}
        courseNameByCode={courseNameByCode}
      />
    </div>
  );
}
