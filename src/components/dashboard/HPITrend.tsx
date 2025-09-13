import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const trendData = [
  { month: "Jan", hpi: 85, avg: 80 },
  { month: "Feb", hpi: 82, avg: 79 },
  { month: "Mar", hpi: 78, avg: 78 },
  { month: "Apr", hpi: 75, avg: 77 },
  { month: "May", hpi: 73, avg: 76 },
  { month: "Jun", hpi: 72, avg: 75 },
  { month: "Jul", hpi: 70, avg: 74 },
  { month: "Aug", hpi: 69, avg: 73 },
  { month: "Sep", hpi: 71, avg: 72 },
  { month: "Oct", hpi: 72, avg: 71 },
  { month: "Nov", hpi: 73, avg: 72 },
  { month: "Dec", hpi: 72, avg: 72 },
];

export function HPITrend() {
  return (
    <ChartCard title="HPI Trend Over Time">
      <div className="text-xs text-muted-foreground mb-4">
        Monthly heavy metal pollution index trend with regional average
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            domain={[65, 90]}
          />
          <Area 
            type="monotone" 
            dataKey="hpi" 
            stackId="1"
            stroke="hsl(var(--chart-1))" 
            fill="hsl(var(--chart-1))"
            fillOpacity={0.3}
          />
          <Area 
            type="monotone" 
            dataKey="avg" 
            stackId="2"
            stroke="hsl(var(--chart-2))" 
            fill="hsl(var(--chart-2))"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-1" />
          <span className="text-muted-foreground">Current HPI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-2" />
          <span className="text-muted-foreground">Regional Average</span>
        </div>
      </div>
    </ChartCard>
  );
}