import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  status?: "safe" | "warning" | "critical";
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  status = "safe",
  description,
  className
}: MetricCardProps) {
  const statusColors = {
    safe: "text-success",
    warning: "text-warning", 
    critical: "text-destructive"
  };

  const statusBg = {
    safe: "bg-success/10",
    warning: "bg-warning/10",
    critical: "bg-destructive/10"
  };

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{value}</span>
            {subtitle && (
              <span className={cn("text-sm font-medium", statusColors[status])}>
                {subtitle}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          <div className={cn("w-full h-1 rounded-full", statusBg[status])}>
            <div className={cn("h-full rounded-full", statusColors[status].replace('text-', 'bg-'))} style={{width: status === 'safe' ? '70%' : status === 'warning' ? '45%' : '25%'}} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}