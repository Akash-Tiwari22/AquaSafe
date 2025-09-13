import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const data = [
  { month: "Oct 22", aqi: 85 },
  { month: "Jan 23", aqi: 78 },
  { month: "Apr 23", aqi: 82 },
  { month: "Jul 23", aqi: 71 },
  { month: "Oct 23", aqi: 69 },
  { month: "Jan 24", aqi: 73 },
  { month: "Apr 24", aqi: 68 },
];

export function PredictiveForecast() {
  return (
    <ChartCard title="Predictive AQI Forecast">
      <div className="text-xs text-muted-foreground mb-4">
        Predicted heavy metal pollution index for the next 6 months
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
            dataKey="aqi" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-2 mt-4 text-xs">
        <div className="w-3 h-3 rounded bg-chart-1" />
        <span className="text-muted-foreground">Predicted AQI</span>
      </div>
    </ChartCard>
  );
}