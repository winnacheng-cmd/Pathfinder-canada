import Link from "next/link";
import { Info } from "lucide-react";

export function SampleDataNotice() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Info className="size-3.5 shrink-0" aria-hidden="true" />
      Sample data — not verified official requirements. See{" "}
      <Link href="/methodology" className="underline underline-offset-2">
        methodology
      </Link>
      .
    </p>
  );
}
