import Link from "next/link";
import { getAllFeedback, getRecentAuditLog, getVerificationQueue } from "@/lib/queries/admin-catalog";
import { MetricCard } from "@/components/MetricCard";

export default async function AdminOverviewPage() {
  const [{ stale, needsReview, noSource, expiringSoon }, feedback, auditLog] = await Promise.all([
    getVerificationQueue(),
    getAllFeedback(),
    getRecentAuditLog(10),
  ]);
  const openFeedback = feedback.filter((f) => f.status === "open");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Data quality and review queue.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Stale requirements" value={stale.length} />
        <MetricCard label="Needs review" value={needsReview.length} />
        <MetricCard label="Missing a source" value={noSource.length} />
        <MetricCard label="Expiring within 30 days" value={expiringSoon.length} />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Open feedback</h2>
          <Link href="/admin/feedback" className="text-sm text-primary underline underline-offset-2">
            View all
          </Link>
        </div>
        {openFeedback.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open reports.</p>
        ) : (
          <ul className="space-y-2">
            {openFeedback.slice(0, 5).map((f) => (
              <li key={f.id} className="rounded-md border border-border p-3 text-sm">
                <span className="font-medium">{f.feedback_type.replace(/_/g, " ")}</span>
                {f.programName && <span className="text-muted-foreground"> · {f.programName}</span>}
                {f.body && <p className="mt-1 text-muted-foreground">{f.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent admin activity</h2>
          <Link href="/admin/audit" className="text-sm text-primary underline underline-offset-2">
            Full log
          </Link>
        </div>
        {auditLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admin edits yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {auditLog.slice(0, 5).map((entry) => (
              <li key={entry.id} className="flex justify-between rounded-md border border-border p-2.5">
                <span>
                  {entry.action} {entry.entity_type.replace(/_/g, " ")}
                </span>
                <span className="text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
