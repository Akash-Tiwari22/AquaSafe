import { MetricCard } from "./MetricCard";
import { useData } from "@/contexts/DataContext";

// BIS/WHO permissible limits (mg/L) to align with backend WATER_QUALITY_STANDARDS
const METAL_LIMITS_MG_L: Record<string, number> = {
  arsenic: 0.01,
  lead: 0.01,
  mercury: 0.001,
  cadmium: 0.003,
  chromium: 0.05,
  iron: 0.3
};

function classifyByLimit(percentOfLimit: number): "safe" | "warning" | "critical" {
  if (percentOfLimit > 100) return "critical";
  if (percentOfLimit >= 80) return "warning";
  return "safe";
}

export function MetalConcentrationCards() {
  const { getCurrentData } = useData();
  const data = getCurrentData();

  const metals: Array<{
    key: keyof typeof data.metalConcentrations;
    label: string;
  }> = [
    { key: 'arsenic', label: 'Arsenic' },
    { key: 'lead', label: 'Lead' },
    { key: 'mercury', label: 'Mercury' },
    { key: 'cadmium', label: 'Cadmium' },
    { key: 'chromium', label: 'Chromium' },
    { key: 'iron', label: 'Iron' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metals.map(({ key, label }) => {
        const valueMgL = data.metalConcentrations?.[key] ?? 0;
        const limitMgL = METAL_LIMITS_MG_L[key] ?? 0;
        const percent = limitMgL > 0 ? (valueMgL / limitMgL) * 100 : 0;
        const status = classifyByLimit(percent);
        // Display in μg/L for consistency with UI (1 mg/L = 1000 μg/L)
        const valueUgL = valueMgL * 1000;
        const limitUgL = limitMgL * 1000;
        return (
          <MetricCard
            key={label}
            title={label}
            value={valueUgL.toFixed(valueUgL >= 10 ? 1 : 2)}
            subtitle="μg/L"
            status={status}
            description={`${Math.round(percent)}% of BIS limit (${limitUgL % 1 === 0 ? limitUgL.toFixed(0) : limitUgL.toFixed(1)} μg/L)`}
          />
        );
      })}
    </div>
  );
}