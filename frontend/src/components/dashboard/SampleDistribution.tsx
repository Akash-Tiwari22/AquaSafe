import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";

const data = [
  { name: "Safe Samples", value: 65, color: "#22c55e" },
  { name: "Unsafe Samples", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Critical Samples", value: 15, color: "hsl(var(--destructive))" },
];

export function SampleDistribution() {
  return (
    <ChartCard title="Sample Distribution">
      <div className="text-xs text-muted-foreground mb-4">
        Percentage distribution of safe, unsafe, and critical water samples
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}