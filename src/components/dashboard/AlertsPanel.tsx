import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";

const alerts = [
  {
    type: "critical",
    title: "Arsenic levels crossed WHO limits by 0.3x",
    location: "Delhi, found heavy Zinc & Cr4 at 15 Dp at depth",
    time: "2 mins ago"
  },
  {
    type: "warning", 
    title: "Cadmium levels showing an upward trend",
    location: "Maharashtra, Industrial area 3 2022-03-05 at 15:30",
    time: "5 mins ago"
  },
  {
    type: "warning",
    title: "Mercury spike detected, immediate investigation required",
    location: "Gujarat, Industrial zone 4 2022-01-05 at 16:15",
    time: "8 mins ago"
  },
  {
    type: "critical",
    title: "Chromium contamination in raw water",
    location: "West Bengal, North Sector A 2022-01-03 at 09:05",
    time: "15 mins ago"
  }
];

export function AlertsPanel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Critical Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground">
          Immediate action required for live contamination conditions
        </div>
        {alerts.map((alert, index) => (
          <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30">
            <AlertTriangle className={`w-4 h-4 mt-0.5 ${
              alert.type === 'critical' ? 'text-destructive' : 'text-warning'
            }`} />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.location}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {alert.time}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}