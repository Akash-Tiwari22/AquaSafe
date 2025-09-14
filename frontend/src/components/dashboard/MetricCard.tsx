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
  const statusConfig = {
    safe: {
      text: "text-success",
      bg: "metric-card-success",
      progress: "bg-success",
      width: "70%"
    },
    warning: {
      text: "text-warning",
      bg: "metric-card-warning", 
      progress: "bg-warning",
      width: "45%"
    },
    critical: {
      text: "text-destructive",
      bg: "metric-card-destructive",
      progress: "bg-destructive", 
      width: "25%"
    }
  };

  const config = statusConfig[status];

  return (
    <Card className={cn("card-enhanced", config.bg, className)}>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-high-contrast">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-high-contrast">{value}</span>
            {subtitle && (
              <span className={cn("text-sm font-medium", config.text)}>
                {subtitle}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-high-contrast">{description}</p>
          )}
          <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", config.progress)} 
              style={{width: config.width}}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}