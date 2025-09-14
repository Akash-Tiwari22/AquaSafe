import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Download, Filter } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const timeRanges = ["1M", "3M", "6M", "1Y", "All"];

const trendData = [
  { month: "Jan", hmpi: 68, arsenic: 0.008, lead: 0.003, mercury: 0.001 },
  { month: "Feb", hmpi: 72, arsenic: 0.009, lead: 0.004, mercury: 0.001 },
  { month: "Mar", hmpi: 75, arsenic: 0.007, lead: 0.003, mercury: 0.001 },
  { month: "Apr", hmpi: 78, arsenic: 0.006, lead: 0.002, mercury: 0.001 },
  { month: "May", hmpi: 82, arsenic: 0.005, lead: 0.002, mercury: 0.001 },
  { month: "Jun", hmpi: 85, arsenic: 0.004, lead: 0.001, mercury: 0.001 },
];

export function HistoricalTrends() {
  const { getCurrentData } = useData();
  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-high-contrast">Historical Trends</h1>
          <p className="text-muted-high-contrast">Water quality trends and historical data analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Time Range Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={range === "6M" ? "default" : "outline"}
                size="sm"
                className={range === "6M" ? "btn-primary-enhanced" : ""}
              >
                {range}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* HMPI Trend Chart */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Heavy Metal Pollution Index (HMPI) Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-sm text-muted-high-contrast">Interactive HMPI Trend Chart</div>
              <div className="text-xs text-muted-high-contrast">Last 6 months: 68 → 85 (Improving)</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">+17</div>
              <div className="text-xs text-muted-high-contrast">HMPI Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">25%</div>
              <div className="text-xs text-muted-high-contrast">Quality Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">3</div>
              <div className="text-xs text-muted-high-contrast">Peak Incidents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">85</div>
              <div className="text-xs text-muted-high-contrast">Current HMPI</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metal Concentration Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-high-contrast">Arsenic Levels Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🧪</div>
                <div className="text-sm text-muted-high-contrast">Arsenic Concentration Chart</div>
                <div className="text-xs text-success">Decreasing trend: 0.008 → 0.004 mg/L</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-high-contrast">Jan: 0.008 mg/L</span>
              <span className="text-success font-semibold">Jun: 0.004 mg/L</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-high-contrast">Lead Levels Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">⚗️</div>
                <div className="text-sm text-muted-high-contrast">Lead Concentration Chart</div>
                <div className="text-xs text-success">Decreasing trend: 0.003 → 0.001 mg/L</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-high-contrast">Jan: 0.003 mg/L</span>
              <span className="text-success font-semibold">Jun: 0.001 mg/L</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Comparison */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast">Regional Water Quality Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { region: "Delhi", hmpi: 72, status: "warning", trend: "stable" },
              { region: "Mumbai", hmpi: 85, status: "good", trend: "improving" },
              { region: "Chennai", hmpi: 78, status: "good", trend: "improving" },
              { region: "Kolkata", hmpi: 65, status: "critical", trend: "declining" },
              { region: "Bangalore", hmpi: 88, status: "excellent", trend: "improving" }
            ].map((region) => (
              <div key={region.region} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    region.status === "excellent" ? "bg-success" :
                    region.status === "good" ? "bg-primary" :
                    region.status === "warning" ? "bg-warning" : "bg-destructive"
                  }`} />
                  <span className="font-medium text-high-contrast">{region.region}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-high-contrast">HMPI: {region.hmpi}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    region.trend === "improving" ? "bg-success/20 text-success" :
                    region.trend === "stable" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
                  }`}>
                    {region.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

