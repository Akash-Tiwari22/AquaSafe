import { Sidebar } from "@/components/dashboard/Sidebar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { HeavyMetalChart } from "@/components/dashboard/HeavyMetalChart";
import { SampleDistribution } from "@/components/dashboard/SampleDistribution";
import { PredictiveForecast } from "@/components/dashboard/PredictiveForecast";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ContaminationTable } from "@/components/dashboard/ContaminationTable";
import { HistoricalData } from "@/components/dashboard/HistoricalData";
import { HPITrend } from "@/components/dashboard/HPITrend";
import { KeyFindings } from "@/components/dashboard/KeyFindings";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { MetalConcentrationCards } from "@/components/dashboard/MetalConcentrationCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-6">
        <SearchBar />
        <FilterBar />
        
        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Avg HMPI"
            value="72.5"
            subtitle="+0.3% from last month"
            status="safe"
            description="Overall heavy metal pollution levels"
          />
          <MetricCard
            title="Safe Quality"
            value="70%"
            subtitle="Safe"
            status="safe"
            description="Samples within acceptable limits"
          />
          <MetricCard
            title="Unsafe/Critical"
            value="30%"
            subtitle="Critical"
            status="warning"
            description="Samples exceeding permissible limits"
          />
        </div>

        {/* Metal Concentration Cards */}
        <div className="mb-6">
          <MetalConcentrationCards />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HeavyMetalChart />
          <SampleDistribution />
          <FileUpload />
          
          {/* India Water Quality Hotspots */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                India Water Quality Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4">
                Identified water quality hot spots across key industrial zones
              </div>
              <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-2xl mb-2">🗺️</div>
                  <div className="text-sm">Interactive Map</div>
                  <div className="text-xs">India Water Quality Hotspots</div>
                </div>
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span>Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning" />
                  <span>Borderline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive" />
                  <span>Unsafe</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ContaminationTable />
        </div>

        {/* Middle Row - New Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HistoricalData />
          <HPITrend />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PredictiveForecast />
          <AlertsPanel />
          <KeyFindings />
        </div>
      </main>
    </div>
  );
};

export default Index;
