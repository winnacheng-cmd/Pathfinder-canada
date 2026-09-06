import { getAllInstitutions } from "@/lib/queries/admin-catalog";
import { InstitutionsManager } from "@/features/admin/InstitutionsManager";

export const metadata = { title: "Institutions" };

export default async function AdminInstitutionsPage() {
  const institutions = await getAllInstitutions();
  return <InstitutionsManager initial={institutions} />;
}
