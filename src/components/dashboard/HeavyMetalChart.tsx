import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const data = [
  { name: "Arsenic", safe: 45, critical: 15 },
  { name: "Lead", safe: 60, critical: 25 },
  { name: "Mercury", safe: 80, critical: 10 },
  { name: "Cadmium", safe: 35, critical: 30 },
  { name: "Chromium", safe: 70, critical: 20 },
  { name: "Iron", safe: 55, critical: 35 },
  { name: "Copper", safe: 65, critical: 15 },
];

export function HeavyMetalChart() {
  return (
    <ChartCard title="Heavy Metal Concentrations">
      <div className="text-xs text-muted-foreground mb-4">
        Average levels of heavy metals across sampling locations
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <YAxis hide />
          <Bar dataKey="safe" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
          <Bar dataKey="critical" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-1" />
          <span className="text-muted-foreground">Safe Levels</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-3" />
          <span className="text-muted-foreground">Critical Levels</span>
        </div>
      </div>
    </ChartCard>
  );
}