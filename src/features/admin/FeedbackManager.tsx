"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { Inbox } from "lucide-react";
import { updateFeedbackStatusAction } from "./actions";
import type { Feedback } from "@/types/database";

type FeedbackRow = Feedback & { programName: string | null };

export function FeedbackManager({ initial }: { initial: FeedbackRow[] }) {
  const [rows, setRows] = useState(initial);
  const [, startTransition] = useTransition();

  function updateStatus(id: string, status: Feedback["status"]) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(async () => {
      await updateFeedbackStatusAction({ id, status });
    });
  }

  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title="No reports yet" description="Student-submitted data reports will show up here." />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="capitalize">{row.feedback_type.replace(/_/g, " ")}</TableCell>
                <TableCell>{row.programName ?? "—"}</TableCell>
                <TableCell className="max-w-[280px] text-sm text-muted-foreground">{row.body ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(row.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select value={row.status} onValueChange={(status) => updateStatus(row.id, status as Feedback["status"])}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
