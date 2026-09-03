import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning";
}

export function SummaryCard({ label, value, icon: Icon, tone = "default" }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-2">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            tone === "success" && "bg-status-success/15 text-status-success",
            tone === "warning" && "bg-status-warning/15 text-status-warning",
            tone === "default" && "bg-muted text-foreground",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value.toLocaleString("pt-BR")}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
