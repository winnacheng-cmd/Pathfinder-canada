import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUserAndProfile } from "@/lib/queries/profile";
import { getCourses, getAllProgramsWithInstitution } from "@/lib/queries/catalog";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect("/login");
  if (profile) redirect("/dashboard");

  const [courses, programs] = await Promise.all([
    getCourses("BC", "BC Graduation Program"),
    getAllProgramsWithInstitution(),
  ]);

  return <OnboardingWizard availableCourses={courses} availablePrograms={programs} />;
}
