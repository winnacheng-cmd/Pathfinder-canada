import { getAllSources } from "@/lib/queries/admin-catalog";
import { SourcesManager } from "@/features/admin/SourcesManager";

export const metadata = { title: "Sources" };

export default async function AdminSourcesPage() {
  const sources = await getAllSources();
  return <SourcesManager initial={sources} />;
}
