import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

const findings = [
  {
    icon: TrendingDown,
    title: "Overall Improvement",
    description: "HMPI decreased by 12% compared to last year, indicating better water quality management.",
    status: "positive"
  },
  {
    icon: AlertTriangle,
    title: "Critical Hotspots",
    description: "Delhi and West Bengal show critical contamination levels requiring immediate attention.",
    status: "warning"
  },
  {
    icon: CheckCircle,
    title: "BIS Compliance",
    description: "70% of monitored regions maintain heavy metal levels within BIS acceptable limits.",
    status: "positive"
  },
  {
    icon: BarChart3,
    title: "Prediction Accuracy",
    description: "AI models show 94% accuracy in predicting contamination trends for next quarter.",
    status: "neutral"
  }
];

export function KeyFindings() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Key Findings Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-4">
          Critical insights from water quality analysis and monitoring data
        </div>
        <div className="space-y-4">
          {findings.map((finding, index) => {
            const Icon = finding.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className={`p-1.5 rounded-full ${
                  finding.status === 'positive' ? 'bg-success/20 text-success' :
                  finding.status === 'warning' ? 'bg-warning/20 text-warning' : 
                  'bg-primary/20 text-primary'
                }`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground mb-1">
                    {finding.title}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {finding.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}