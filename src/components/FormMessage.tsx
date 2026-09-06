import { cn } from "@/lib/utils";

export function FormMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (!error && !success) return null;
  return (
    <p
      role="alert"
      className={cn(
        "text-sm rounded-md px-3 py-2",
        error && "bg-destructive/10 text-destructive",
        success && "bg-success/10 text-success"
      )}
    >
      {error ?? success}
    </p>
  );
}
