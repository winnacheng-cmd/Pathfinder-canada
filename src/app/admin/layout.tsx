import Link from "next/link";
import { requireAdmin } from "@/lib/queries/admin";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: { template: "%s — Admin", default: "Admin" }, robots: { index: false } };

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/institutions", label: "Institutions" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/requirements", label: "Requirements" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold tracking-tight">
              Pathfinder Admin
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Back to app
            </Link>
          </div>
          <form action={signOutAction}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Admin">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
