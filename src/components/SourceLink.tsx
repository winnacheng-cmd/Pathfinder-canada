import { ExternalLink } from "lucide-react";

export function SourceLink({
  url,
  label = "Official source",
}: {
  url: string;
  label?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2 hover:no-underline"
    >
      {label}
      <ExternalLink className="size-3.5" aria-hidden="true" />
    </a>
  );
}
