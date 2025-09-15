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
import { MetalConcentrationCards } from "@/components/dashboard/MetalConcentrationCards";
import { DataViewToggle } from "@/components/dashboard/DataViewToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, ArrowLeft, MapPin } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import WorldMap from "@/components/maps/WorldMap";

const Index = () => {
  const { getCurrentData, currentView } = useData();
  const currentData = getCurrentData();
  const navigate = useNavigate();

  const handleDownload = (format: 'excel' | 'pdf' | 'all') => {
    // Use current data for download
    const sampleData = {
      timestamp: currentData.lastUpdated,
      metrics: {
        avgHMPI: currentData.avgHMPI,
        safeQuality: currentData.safeQuality,
        unsafeCritical: currentData.unsafeCritical
      },
      analysis: `Water Quality Analysis Report - ${currentView === 'uploaded' ? 'Uploaded Data Analysis' : 'Complete Dataset Analysis'}`
    };

    if (format === 'excel') {
      // For Excel download, we'll create a simple CSV
      const csvContent = `Metric,Value,Status
Average HMPI,${currentData.avgHMPI.toFixed(1)},${currentData.avgHMPI > 70 ? 'Safe' : 'Warning'}
Safe Quality,${currentData.safeQuality.toFixed(1)}%,${currentData.safeQuality > 60 ? 'Good' : 'Poor'}
Unsafe/Critical,${currentData.unsafeCritical.toFixed(1)}%,${currentData.unsafeCritical < 40 ? 'Warning' : 'Critical'}
Sample Count,${currentData.sampleCount},Current
Analysis Date,${new Date().toLocaleDateString()},Current
Data Source,${currentView === 'uploaded' ? 'Uploaded File' : 'Complete Dataset'},Current`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water-quality-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF, we'll create a simple text file for now
      const pdfContent = `Water Quality Analysis Report
Generated: ${new Date().toLocaleDateString()}
Data Source: ${currentView === 'uploaded' ? 'Uploaded File' : 'Complete Dataset'}

Key Metrics:
- Average HMPI: ${currentData.avgHMPI.toFixed(1)} (${currentData.avgHMPI > 70 ? 'Safe' : 'Warning'})
- Safe Quality: ${currentData.safeQuality.toFixed(1)}%
- Unsafe/Critical: ${currentData.unsafeCritical.toFixed(1)}%
- Sample Count: ${currentData.sampleCount}

Metal Concentrations:
- Arsenic: ${currentData.metalConcentrations.arsenic.toFixed(4)} mg/L
- Lead: ${currentData.metalConcentrations.lead.toFixed(4)} mg/L
- Mercury: ${currentData.metalConcentrations.mercury.toFixed(4)} mg/L
- Cadmium: ${currentData.metalConcentrations.cadmium.toFixed(4)} mg/L
- Chromium: ${currentData.metalConcentrations.chromium.toFixed(4)} mg/L

This report contains comprehensive analysis of heavy metal contamination levels and water quality metrics.`;
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water-quality-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'all') {
      // Download both formats
      handleDownload('excel');
      setTimeout(() => handleDownload('pdf'), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-dark-blue">AquaSafe</span>
              </div>
            </div>
            
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask in natural language:"
                  defaultValue="Show arsenic hotspots near Nashik in 2019"
                  className="w-full px-4 py-2 pl-4 pr-20 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-4 py-1 text-sm">
                  Submit
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-primary"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => navigate('/signup')}
              >
                Register
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                New Analysis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="p-6 pb-0">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 border-gray-300 hover:border-blue-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </Button>
      </div>
      
      <main className="p-6 pt-0">
        <SearchBar />
        <FilterBar />
      
      {/* Analysis Section Header with Download Button */}
      <div className="mb-6">
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-high-contrast mb-2">
                  Water Quality Analysis Dashboard
                </CardTitle>
                <p className="text-sm text-muted-high-contrast">
                  Comprehensive analysis of heavy metal contamination levels and water quality metrics
                </p>
                <div className="mt-3">
                  <DataViewToggle />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleDownload('excel')}
                  className="bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Download Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleDownload('pdf')}
                  className="bg-success/10 border-success/20 hover:bg-success/20 text-success hover:text-success-foreground transition-all duration-300"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  size="lg"
                  onClick={() => handleDownload('all')}
                  className="btn-primary-enhanced"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="HMPI"
          value={currentData.avgHMPI.toFixed(1)}
          subtitle={currentData.avgHMPI > 70 ? "Safe" : "Warning"}
          status={currentData.avgHMPI > 70 ? "safe" : "warning"}
          description="Overall heavy metal pollution levels"
        />
        <MetricCard
          title="Safe Quality"
          value={`${currentData.safeQuality.toFixed(1)}%`}
          subtitle={currentData.safeQuality > 60 ? "Good" : "Poor"}
          status={currentData.safeQuality > 60 ? "safe" : "warning"}
          description="Samples within acceptable limits"
        />
        <MetricCard
          title="Unsafe/Critical"
          value={`${currentData.unsafeCritical.toFixed(1)}%`}
          subtitle={currentData.unsafeCritical < 40 ? "Warning" : "Critical"}
          status={currentData.unsafeCritical < 40 ? "warning" : "destructive"}
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
        
        {/* India Water Quality Hotspots */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>India Water Quality Hotspots</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-4">
              Interactive map showing water quality status across major Indian cities
            </div>
            <WorldMap height="400px" />
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
