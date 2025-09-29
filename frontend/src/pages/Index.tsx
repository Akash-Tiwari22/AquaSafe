import React, { useState } from "react";
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
import { SiriAnimation } from "@/components/ui/siri-animation";
import { QueryProcessor } from "@/services/queryProcessor";

const Index = () => {
  const { getCurrentData, currentView } = useData();
  const currentData = getCurrentData();
  const navigate = useNavigate();
  const [showSiriAnimation, setShowSiriAnimation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');

  // Handle search submit with Siri animation
  const handleSearchSubmit = () => {
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    const query = inputElement?.value || 'Show arsenic hotspots near Nashik in 2019';
    
    setSearchQuery(query);
    setShowSiriAnimation(true);
    
    // Process the query
    const processor = new QueryProcessor(currentData);
    const response = processor.processQuery(query);
    setQueryResponse(response.answer);
  };

  const handleAnimationComplete = () => {
    setShowSiriAnimation(false);
    // Clear the query for next use
    setTimeout(() => {
      setSearchQuery('');
      setQueryResponse('');
    }, 1000);
  };

  const handleAnimationClose = () => {
    setShowSiriAnimation(false);
    setSearchQuery('');
    setQueryResponse('');
  };

  // Function to create charts as images for PDF
  const createChartImage = async (chartData: any, chartType: string, title: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('');
        return;
      }
      
      // Clear canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (chartType === 'pie') {
        // Draw pie chart
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        let startAngle = 0;
        const colors = ['#4CAF50', '#F44336', '#FF9800'];
        
        // Title
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, centerX, 30);
        
        chartData.forEach((item: any, index: number) => {
          const sliceAngle = (item.value / 100) * 2 * Math.PI;
          
          // Draw slice
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fillStyle = colors[index] || '#999';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw label
          const labelAngle = startAngle + sliceAngle / 2;
          const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
          const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
          
          ctx.fillStyle = '#333';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${item.name}: ${item.value}%`, labelX, labelY);
          
          startAngle += sliceAngle;
        });
      } else if (chartType === 'bar') {
        // Draw bar chart
        const margin = 50;
        const chartWidth = canvas.width - 2 * margin;
        const chartHeight = canvas.height - 2 * margin - 50;
        
        // Title
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, 30);
        
        const barWidth = chartWidth / chartData.length - 10;
        const maxValue = Math.max(...chartData.map((item: any) => parseFloat(item.value)));
        
        chartData.forEach((item: any, index: number) => {
          const barHeight = (parseFloat(item.value) / maxValue) * chartHeight;
          const x = margin + index * (barWidth + 10);
          const y = canvas.height - margin - barHeight;
          
          // Draw bar
          ctx.fillStyle = parseFloat(item.value) > parseFloat(item.limit) ? '#F44336' : '#4CAF50';
          ctx.fillRect(x, y, barWidth, barHeight);
          
          // Draw value on top of bar
          ctx.fillStyle = '#333';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(item.value, x + barWidth / 2, y - 5);
          
          // Draw label at bottom
          ctx.save();
          ctx.translate(x + barWidth / 2, canvas.height - margin + 15);
          ctx.rotate(-Math.PI / 4);
          ctx.textAlign = 'right';
          ctx.fillText(item.name, 0, 0);
          ctx.restore();
        });
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin);
        ctx.stroke();
      }
      
      resolve(canvas.toDataURL('image/png'));
    });
  };

  const handleDownload = async (format: 'excel' | 'pdf' | 'all') => {
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
      // Create Excel file with data and charts using SheetJS
      const XLSX = await import('xlsx');
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Main data sheet
      const mainData = [
        ['Water Quality Analysis Report'],
        ['Generated:', new Date().toLocaleDateString()],
        ['Data Source:', currentView === 'uploaded' ? 'Uploaded File' : 'Complete Dataset'],
        [''],
        ['Key Metrics', 'Value', 'Status'],
        ['Average HMPI', currentData.avgHMPI.toFixed(1), currentData.avgHMPI >= 100 ? 'Critical' : currentData.avgHMPI >= 90 ? 'Warning' : 'Safe'],
        ['Safe Quality (%)', currentData.safeQuality.toFixed(1), currentData.safeQuality > 60 ? 'Good' : 'Poor'],
        ['Unsafe/Critical (%)', currentData.unsafeCritical.toFixed(1), currentData.unsafeCritical < 40 ? 'Warning' : 'Critical'],
        ['Sample Count', currentData.sampleCount, 'Current'],
        [''],
        ['Metal Concentrations (mg/L)', 'Value', 'BIS Limit'],
        ['Arsenic', currentData.metalConcentrations.arsenic.toFixed(4), '0.01'],
        ['Lead', currentData.metalConcentrations.lead.toFixed(4), '0.01'],
        ['Mercury', currentData.metalConcentrations.mercury.toFixed(4), '0.001'],
        ['Cadmium', currentData.metalConcentrations.cadmium.toFixed(4), '0.003'],
        ['Chromium', currentData.metalConcentrations.chromium.toFixed(4), '0.05']
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(mainData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Analysis Report');
      
      // Enhanced Chart data sheet with detailed data for chart creation
      const pieChartData = [
        ['Sample Distribution Chart Data'],
        [''],
        ['Category', 'Percentage', 'Count', 'Color Code'],
        ['Safe Samples', currentData.safeQuality.toFixed(1), Math.round(currentData.sampleCount * currentData.safeQuality / 100), 'Green'],
        ['Unsafe/Critical', currentData.unsafeCritical.toFixed(1), Math.round(currentData.sampleCount * currentData.unsafeCritical / 100), 'Red'],
        [''],
        ['Instructions:'],
        ['1. Select data in rows 3-4 (Category and Percentage columns)'],
        ['2. Insert > Charts > Pie Chart'],
        ['3. Format colors: Safe=Green, Unsafe/Critical=Red'],
        [''],
        ['Heavy Metal Concentrations Chart Data'],
        [''],
        ['Metal', 'Concentration (mg/L)', 'BIS Limit', 'Status'],
        ['Arsenic', currentData.metalConcentrations.arsenic.toFixed(4), '0.01', currentData.metalConcentrations.arsenic > 0.01 ? 'Exceeds' : 'Within Limit'],
        ['Lead', currentData.metalConcentrations.lead.toFixed(4), '0.01', currentData.metalConcentrations.lead > 0.01 ? 'Exceeds' : 'Within Limit'],
        ['Mercury', currentData.metalConcentrations.mercury.toFixed(4), '0.001', currentData.metalConcentrations.mercury > 0.001 ? 'Exceeds' : 'Within Limit'],
        ['Cadmium', currentData.metalConcentrations.cadmium.toFixed(4), '0.003', currentData.metalConcentrations.cadmium > 0.003 ? 'Exceeds' : 'Within Limit'],
        ['Chromium', currentData.metalConcentrations.chromium.toFixed(4), '0.05', currentData.metalConcentrations.chromium > 0.05 ? 'Exceeds' : 'Within Limit'],
        [''],
        ['Instructions:'],
        ['1. Select data in rows 15-19 (Metal, Concentration, BIS Limit columns)'],
        ['2. Insert > Charts > Column Chart'],
        ['3. Add series for both Concentration and BIS Limit'],
        ['4. Format bars: Concentration=Blue, BIS Limit=Orange']
      ];
      
      const ws2 = XLSX.utils.aoa_to_sheet(pieChartData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Chart Data & Instructions');
      
      // HMPI Trend Data (sample historical data)
      const trendData = [
        ['HMPI Trend Over Time'],
        [''],
        ['Month', 'HMPI Value', 'Target', 'Status'],
        ['Jan 2024', '85.2', '70', 'Above Target'],
        ['Feb 2024', '82.1', '70', 'Above Target'],
        ['Mar 2024', '78.5', '70', 'Above Target'],
        ['Apr 2024', '75.3', '70', 'Above Target'],
        ['May 2024', '73.8', '70', 'Above Target'],
        ['Jun 2024', currentData.avgHMPI.toFixed(1), '100', currentData.avgHMPI >= 100 ? 'Above Threshold' : 'Below Threshold'],
        [''],
        ['Instructions:'],
        ['1. Select data in rows 3-8 (Month, HMPI Value, Target columns)'],
        ['2. Insert > Charts > Line Chart'],
        ['3. Add both HMPI Value and Target as separate series'],
        ['4. Format: HMPI Value=Blue line, Target=Red dashed line']
      ];
      
      const ws3 = XLSX.utils.aoa_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, ws3, 'HMPI Trend Data');
      
      // Add formatting and styling with improved column widths
      ws1['!cols'] = [{ width: 30 }, { width: 18 }, { width: 18 }];
      ws2['!cols'] = [{ width: 25 }, { width: 22 }, { width: 18 }, { width: 18 }];
      ws3['!cols'] = [{ width: 18 }, { width: 18 }, { width: 12 }, { width: 18 }];
      
      // Write file
      XLSX.writeFile(wb, `water-quality-analysis-with-charts-${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } else if (format === 'pdf') {
      // Create proper PDF using jsPDF with improved layout
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      let yPos = 30;
      const pageHeight = 297; // A4 page height in mm
      const marginBottom = 30;
      const maxContentHeight = pageHeight - marginBottom;
      
      // Helper function to check and add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > maxContentHeight) {
          doc.addPage();
          yPos = 30;
          return true;
        }
        return false;
      };
      
      // Title Section
      doc.setFontSize(20);
      doc.setTextColor(40, 116, 166);
      doc.text('Water Quality Analysis Report', 20, yPos);
      yPos += 25;
      
      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 10;
      doc.text(`Data Source: ${currentView === 'uploaded' ? 'Uploaded File' : 'Complete Dataset'}`, 20, yPos);
      yPos += 25;
      
      // Key Metrics Section
      checkPageBreak(60); // Check if we need space for metrics section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Key Metrics', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      const metrics = [
        `Average HMPI: ${currentData.avgHMPI.toFixed(1)} (${currentData.avgHMPI >= 100 ? 'Critical' : currentData.avgHMPI >= 90 ? 'Warning' : 'Safe'})`,
        `Safe Quality: ${currentData.safeQuality.toFixed(1)}%`,
        `Unsafe/Critical: ${currentData.unsafeCritical.toFixed(1)}%`,
        `Sample Count: ${currentData.sampleCount}`
      ];
      
      metrics.forEach(metric => {
        checkPageBreak(12);
        doc.text(`• ${metric}`, 25, yPos);
        yPos += 12;
      });
      yPos += 10;
      
      // Sample Distribution Chart Section
      const pieChartData = [
        { name: 'Safe Samples', value: currentData.safeQuality },
        { name: 'Unsafe/Critical', value: currentData.unsafeCritical }
      ];
      
      const pieChartImage = await createChartImage(pieChartData, 'pie', 'Sample Distribution');
      if (pieChartImage) {
        checkPageBreak(85); // Space needed for chart title + image
        
        doc.setFontSize(16);
        doc.text('Sample Distribution Chart', 20, yPos);
        yPos += 15;
        
        doc.addImage(pieChartImage, 'PNG', 20, yPos, 80, 60);
        yPos += 70;
      }
      
      // Metal Concentrations Section
      checkPageBreak(70); // Space needed for section title + content
      doc.setFontSize(16);
      doc.text('Metal Concentrations (mg/L)', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      const metals = [
        `Arsenic: ${currentData.metalConcentrations.arsenic.toFixed(4)} mg/L (BIS Limit: 0.01)`,
        `Lead: ${currentData.metalConcentrations.lead.toFixed(4)} mg/L (BIS Limit: 0.01)`,
        `Mercury: ${currentData.metalConcentrations.mercury.toFixed(4)} mg/L (BIS Limit: 0.001)`,
        `Cadmium: ${currentData.metalConcentrations.cadmium.toFixed(4)} mg/L (BIS Limit: 0.003)`,
        `Chromium: ${currentData.metalConcentrations.chromium.toFixed(4)} mg/L (BIS Limit: 0.05)`
      ];
      
      metals.forEach(metal => {
        checkPageBreak(12);
        doc.text(`• ${metal}`, 25, yPos);
        yPos += 12;
      });
      yPos += 10;
      
      // Heavy Metal Concentrations Chart
      const barChartData = [
        { name: 'Arsenic', value: currentData.metalConcentrations.arsenic.toFixed(4), limit: '0.01' },
        { name: 'Lead', value: currentData.metalConcentrations.lead.toFixed(4), limit: '0.01' },
        { name: 'Mercury', value: currentData.metalConcentrations.mercury.toFixed(4), limit: '0.001' },
        { name: 'Cadmium', value: currentData.metalConcentrations.cadmium.toFixed(4), limit: '0.003' },
        { name: 'Chromium', value: currentData.metalConcentrations.chromium.toFixed(4), limit: '0.05' }
      ];
      
      const barChartImage = await createChartImage(barChartData, 'bar', 'Heavy Metal Concentrations vs BIS Limits');
      if (barChartImage) {
        checkPageBreak(95); // Space needed for chart title + image
        
        doc.setFontSize(16);
        doc.text('Heavy Metal Concentrations Chart', 20, yPos);
        yPos += 15;
        
        doc.addImage(barChartImage, 'PNG', 20, yPos, 100, 75);
        yPos += 85;
      }
      
      // Conclusion Section
      checkPageBreak(40); // Minimum space needed for conclusion title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Conclusion', 20, yPos);
      yPos += 20;
      
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      
      // Generate dynamic conclusion based on data
      let conclusion = '';
      const hmpiStatus = currentData.avgHMPI >= 100 ? 'critical' : currentData.avgHMPI >= 90 ? 'moderate' : 'safe';
      
      if (hmpiStatus === 'safe') {
        conclusion = `Based on the comprehensive water quality analysis, the overall Heavy Metal Pollution Index (HMPI) of ${currentData.avgHMPI.toFixed(1)} indicates that the water quality is within acceptable limits. With ${currentData.safeQuality.toFixed(1)}% of samples classified as safe, the water source demonstrates good quality standards. However, continuous monitoring is recommended to maintain these standards.`;
      } else if (hmpiStatus === 'moderate') {
        conclusion = `The water quality analysis reveals a moderate concern with an HMPI of ${currentData.avgHMPI.toFixed(1)}. While ${currentData.safeQuality.toFixed(1)}% of samples are safe, the ${currentData.unsafeCritical.toFixed(1)}% unsafe/critical samples require attention. Immediate water treatment measures and regular monitoring are strongly recommended to prevent further deterioration.`;
      } else {
        conclusion = `The analysis indicates critical water quality concerns with an HMPI of ${currentData.avgHMPI.toFixed(1)}. With ${currentData.unsafeCritical.toFixed(1)}% of samples classified as unsafe or critical, immediate intervention is required. This water source poses significant health risks and requires urgent treatment and remediation measures.`;
      }
      
      // Add recommendations
      conclusion += '\n\nRecommendations:\n';
      if (currentData.metalConcentrations.arsenic > 0.01) {
        conclusion += '• Implement arsenic removal systems due to elevated levels\n';
      }
      if (currentData.metalConcentrations.lead > 0.01) {
        conclusion += '• Address lead contamination through pipe replacement or treatment\n';
      }
      if (currentData.metalConcentrations.mercury > 0.001) {
        conclusion += '• Install mercury filtration systems\n';
      }
      conclusion += '• Conduct regular monthly water quality monitoring\n';
      conclusion += '• Implement community awareness programs about water safety';
      
      // Split conclusion into lines and add with proper page breaks
      const lines = doc.splitTextToSize(conclusion, 160);
      lines.forEach((line: string) => {
        checkPageBreak(10);
        doc.text(line, 20, yPos);
        yPos += 8;
      });
      
      // Add footer to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, 20, pageHeight - 15);
        doc.text('Generated by AquaSafe Water Quality Analysis System', 120, pageHeight - 15);
      }
      
      // Save PDF
      doc.save(`water-quality-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } else if (format === 'all') {
      // Download both formats
      await handleDownload('excel');
      setTimeout(async () => await handleDownload('pdf'), 1000);
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
                  className="w-full h-10 px-4 pl-4 pr-24 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-sm"
                />
                <Button 
                  size="sm"
                  onClick={handleSearchSubmit}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 btn-primary-enhanced h-8 px-3 text-xs font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200"
                >
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
        <FilterBar />
      
      {/* Download Buttons Section */}
      <div className="mb-6 flex justify-end">
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleDownload('excel')}
              className="bg-green-50 border-green-200 hover:bg-green-100 text-green-700 hover:text-green-800 transition-all duration-300"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Download Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleDownload('pdf')}
              className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700 hover:text-red-800 transition-all duration-300"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  size="lg"
                  onClick={() => handleDownload('all')}
              className="btn-primary-enhanced hover:shadow-lg transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
      </div>
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="HMPI"
          value={currentData.avgHMPI.toFixed(1)}
          subtitle={currentData.avgHMPI >= 100 ? "Critical" : currentData.avgHMPI >= 90 ? "Warning" : "Safe"}
          status={currentData.avgHMPI >= 100 ? "critical" : currentData.avgHMPI >= 90 ? "warning" : "safe"}
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

      {/* Charts Grid - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <HeavyMetalChart />
        <SampleDistribution />
      </div>
        
      {/* Map and Table Grid - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              Heavy Metal Pollution Index (HMPI) and Water Quality Index (WQI) across major Indian cities
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

      {/* Siri Animation Overlay */}
      <SiriAnimation 
        isActive={showSiriAnimation}
        onComplete={handleAnimationComplete}
        onClose={handleAnimationClose}
        query={searchQuery}
        response={queryResponse}
      />
    </div>
  );
};

export default Index;
