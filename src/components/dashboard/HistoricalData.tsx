import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const historicalData = [
  { year: "2019", current: 95, previous: 92 },
  { year: "2020", current: 88, previous: 95 },
  { year: "2021", current: 82, previous: 88 },
  { year: "2022", current: 79, previous: 82 },
  { year: "2023", current: 75, previous: 79 },
  { year: "2024", current: 72, previous: 75 },
];

export function HistoricalData() {
  return (
    <ChartCard title="Historical Data Comparison">
      <div className="text-xs text-muted-foreground mb-4">
        Year-over-year HMPI comparison showing improvement trends
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="year" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            domain={[70, 100]}
          />
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="previous" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-1" />
          <span className="text-muted-foreground">Current Year</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-2" />
          <span className="text-muted-foreground">Previous Year</span>
        </div>
      </div>
    </ChartCard>
  );
}