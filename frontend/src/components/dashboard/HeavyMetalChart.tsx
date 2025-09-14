import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const data = [
  { name: "Arsenic", concentration: 8.5, bisLimit: 10 },
  { name: "Lead", concentration: 12.3, bisLimit: 10 },
  { name: "Mercury", concentration: 0.8, bisLimit: 1 },
  { name: "Cadmium", concentration: 2.1, bisLimit: 3 },
  { name: "Chromium", concentration: 45.2, bisLimit: 50 },
  { name: "Iron", concentration: 280, bisLimit: 300 },
  { name: "Copper", concentration: 950, bisLimit: 1000 },
];

export function HeavyMetalChart() {
  return (
    <ChartCard title="Heavy Metal Concentrations">
      <div className="text-xs text-muted-foreground mb-4">
        Concentration vs BIS limits in micrograms per liter (μg/L)
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 40 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            label={{ value: 'Heavy Metals', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: '10px' } }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            label={{ value: 'Concentration (μg/L)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: '10px' } }}
          />
          <Bar dataKey="concentration" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
          <Bar dataKey="bisLimit" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-1" />
          <span className="text-muted-foreground">Current Concentration (μg/L)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-3" />
          <span className="text-muted-foreground">BIS Limit (μg/L)</span>
        </div>
      </div>
    </ChartCard>
  );
}