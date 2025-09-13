import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const contaminationData = [
  { region: "Maharashtra", arsenic: "70.5", cadmium: "Unsafe", status: "Warning" },
  { region: "Delhi", arsenic: "182.0", cadmium: "Critical", status: "Critical" },
  { region: "Karnataka", arsenic: "88.1", cadmium: "Lead", status: "Safe" },
  { region: "West Bengal", arsenic: "88.7", cadmium: "Chromium", status: "Critical" },
  { region: "Gujarat", arsenic: "72.0", cadmium: "Mercury", status: "Warning" },
];

export function ContaminationTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Regional Contamination Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-4">
          Detailed heavy metal pollution index across different regions
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground pb-2 border-b border-border">
            <div>Region</div>
            <div>Arsenic AQI</div>
            <div>Pollutant</div>
            <div>Status</div>
          </div>
          {contaminationData.map((row, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 text-xs">
              <div className="text-foreground">{row.region}</div>
              <div className="text-foreground">{row.arsenic}</div>
              <div className="text-foreground">{row.cadmium}</div>
              <div className={`font-medium ${
                row.status === 'Critical' ? 'text-destructive' :
                row.status === 'Warning' ? 'text-warning' : 'text-success'
              }`}>
                {row.status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}