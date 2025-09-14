import { MetricCard } from "./MetricCard";

const metalData = [
  {
    name: "Arsenic",
    concentration: "8.5",
    unit: "μg/L",
    limit: "10 μg/L",
    status: "safe" as const,
    percentage: "85%"
  },
  {
    name: "Lead", 
    concentration: "12.3",
    unit: "μg/L",
    limit: "10 μg/L",
    status: "warning" as const,
    percentage: "123%"
  },
  {
    name: "Mercury",
    concentration: "0.8",
    unit: "μg/L", 
    limit: "1 μg/L",
    status: "safe" as const,
    percentage: "80%"
  },
  {
    name: "Cadmium",
    concentration: "2.1",
    unit: "μg/L",
    limit: "3 μg/L", 
    status: "safe" as const,
    percentage: "70%"
  },
  {
    name: "Chromium",
    concentration: "45.2",
    unit: "μg/L",
    limit: "50 μg/L",
    status: "warning" as const,
    percentage: "90%"
  },
  {
    name: "Iron",
    concentration: "280",
    unit: "μg/L",
    limit: "300 μg/L",
    status: "warning" as const,
    percentage: "93%"
  }
];

export function MetalConcentrationCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metalData.map((metal) => (
        <MetricCard
          key={metal.name}
          title={metal.name}
          value={metal.concentration}
          subtitle={metal.unit}
          status={metal.status}
          description={`${metal.percentage} of BIS limit (${metal.limit})`}
        />
      ))}
    </div>
  );
}