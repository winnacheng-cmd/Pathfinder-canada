import { getAllInstitutions, getAllProgramsForAdmin } from "@/lib/queries/admin-catalog";
import { ProgramsManager } from "@/features/admin/ProgramsManager";

export const metadata = { title: "Programs" };

export default async function AdminProgramsPage() {
  const [programs, institutions] = await Promise.all([getAllProgramsForAdmin(), getAllInstitutions()]);
  return <ProgramsManager initial={programs} institutions={institutions} />;
}
