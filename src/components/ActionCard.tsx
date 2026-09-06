import { BookPlus, CalendarClock, HelpCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActionRecommendation } from "@/domain/recommendations/types";

const ICONS = {
  add_course: BookPlus,
  improve_grade: TrendingUp,
  complete_supplemental: CalendarClock,
  review_needed: HelpCircle,
} as const;

const PRIORITY_STYLES = {
  high: "border-l-4 border-l-destructive",
  medium: "border-l-4 border-l-warning",
  low: "border-l-4 border-l-border",
} as const;

export function ActionCard({ action }: { action: ActionRecommendation }) {
  const Icon = ICONS[action.actionType];

  return (
    <div className={cn("space-y-2 rounded-md border border-border bg-card p-4", PRIORITY_STYLES[action.priority])}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">{action.title}</p>
        </div>
        <Badge variant={action.priority === "high" ? "default" : "secondary"} className="shrink-0 capitalize">
          {action.priority} priority
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{action.explanation}</p>
      {action.affectedProgramNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {action.affectedProgramNames.map((name) => (
            <Badge key={name} variant="outline" className="text-xs font-normal">
              {name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
