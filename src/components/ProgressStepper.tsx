import { cn } from "@/lib/utils";

export function ProgressStepper({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((step, i) => {
        const state = i < currentStep ? "done" : i === currentStep ? "current" : "upcoming";
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                state === "done" && "bg-primary text-primary-foreground",
                state === "current" && "border-2 border-primary text-primary",
                state === "upcoming" && "border border-border text-muted-foreground"
              )}
              aria-current={state === "current" ? "step" : undefined}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-xs sm:inline",
                state === "upcoming" ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-border" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
