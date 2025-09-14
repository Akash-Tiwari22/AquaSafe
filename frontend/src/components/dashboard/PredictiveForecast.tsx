import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const data = [
  { month: "Oct 22", actualHPI: 85, predictedHPI: 83 },
  { month: "Jan 23", actualHPI: 78, predictedHPI: 80 },
  { month: "Apr 23", actualHPI: 82, predictedHPI: 81 },
  { month: "Jul 23", actualHPI: 71, predictedHPI: 73 },
  { month: "Oct 23", actualHPI: 69, predictedHPI: 70 },
  { month: "Jan 24", actualHPI: 73, predictedHPI: 72 },
  { month: "Apr 24", actualHPI: 68, predictedHPI: 69 },
];

export function PredictiveForecast() {
  return (
    <ChartCard title="Predictive HPI Forecast">
      <div className="text-xs text-muted-foreground mb-4">
        Actual HPI vs Predicted heavy metal pollution index comparison
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            domain={[60, 90]}
          />
          <Line 
            type="monotone" 
            dataKey="actualHPI" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="predictedHPI" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-1" />
          <span className="text-muted-foreground">Actual HPI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-2" />
          <span className="text-muted-foreground">Predicted HPI</span>
        </div>
      </div>
    </ChartCard>
  );
}