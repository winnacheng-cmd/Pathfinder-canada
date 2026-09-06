import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
      <span className="font-semibold tracking-tight">Pathfinder Canada</span>
      <nav className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Check My Options</Link>
        </Button>
      </nav>
    </header>
  );
}
