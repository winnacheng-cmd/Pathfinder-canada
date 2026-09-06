import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg items-center px-4">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="That page doesn't exist or may have moved."
        action={
          <Button asChild>
            <Link href="/">Back to Pathfinder Canada</Link>
          </Button>
        }
      />
    </div>
  );
}
