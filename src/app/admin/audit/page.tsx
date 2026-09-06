import { getRecentAuditLog } from "@/lib/queries/admin-catalog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { History } from "lucide-react";

export const metadata = { title: "Audit Log" };

export default async function AdminAuditPage() {
  const entries = await getRecentAuditLog(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
      {entries.length === 0 ? (
        <EmptyState icon={History} title="No admin edits yet" description="Every create, update, and delete of catalog data is recorded here." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="capitalize">{entry.action}</TableCell>
                  <TableCell>{entry.entity_type.replace(/_/g, " ")}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{entry.entity_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
