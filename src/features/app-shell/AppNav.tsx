"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/features/auth/actions";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "My Courses" },
  { href: "/programs", label: "Find Programs" },
  { href: "/targets", label: "My Targets" },
  { href: "/simulator", label: "What-If" },
  { href: "/action-plan", label: "Action Plan" },
];

export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Pathfinder Canada
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname?.startsWith(link.href) && "bg-accent text-accent-foreground font-medium"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings">Settings</Link>
          </Button>
          <form action={signOutAction}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border px-4 py-2 md:hidden" aria-label="Main">
          <ul className="flex flex-col gap-1">
            {[...links, { href: "/settings", label: "Settings" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    pathname?.startsWith(link.href) && "bg-accent text-accent-foreground font-medium"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <form action={signOutAction}>
                <button type="submit" className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
                  Sign out
                </button>
              </form>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
