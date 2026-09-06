import { getAllProgramsForAdmin, getAllRequirementsForAdmin, getAllSources } from "@/lib/queries/admin-catalog";
import { RequirementsManager } from "@/features/admin/RequirementsManager";

export const metadata = { title: "Requirements" };

export default async function AdminRequirementsPage() {
  const [requirements, programs, sources] = await Promise.all([
    getAllRequirementsForAdmin(),
    getAllProgramsForAdmin(),
    getAllSources(),
  ]);
  return <RequirementsManager initial={requirements} programs={programs} sources={sources} />;
}
