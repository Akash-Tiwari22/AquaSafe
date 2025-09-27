import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, BarChart3, CheckCircle, Clock, FileText, HelpCircle, Search, Calendar, Filter, AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { apiService, type WaterQualityData } from "@/services/api";
import { SiriAnimation } from "@/components/ui/siri-animation";
import { QueryProcessor } from "@/services/queryProcessor";

export function PrimaryPage() {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [showSiriAnimation, setShowSiriAnimation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const navigate = useNavigate();
  const { getCurrentData, currentView, setUploadedData, setCurrentView } = useData();
  const currentData = getCurrentData();

  // Function to determine water safety status based on HMPI
  const getWaterSafetyStatus = (hmpi: number) => {
    if (hmpi >= 80) {
      return {
        status: "Critical",
        color: "text-destructive",
        bgColor: "bg-destructive",
        icon: XCircle,
        description: "Water quality is critically unsafe with high heavy metal contamination"
      };
    } else if (hmpi >= 60) {
      return {
        status: "Unsafe",
        color: "text-warning",
        bgColor: "bg-warning",
        icon: AlertTriangle,
        description: "Water quality is unsafe with elevated heavy metal levels"
      };
    } else {
      return {
        status: "Safe",
        color: "text-safe",
        bgColor: "bg-safe",
        icon: CheckCircle,
        description: "Water quality is safe with acceptable heavy metal levels"
      };
    }
  };

  const waterStatus = getWaterSafetyStatus(currentData.avgHMPI);
  const StatusIcon = waterStatus.icon;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setUploadError(null);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to backend
      const response = await apiService.uploadWaterQualityFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Convert backend response to frontend format
      const waterQualityData: WaterQualityData = {
        avgHMPI: response.data.analysis.avgHMPI,
        safeQuality: response.data.analysis.safePercentage,
        unsafeCritical: ((response.data.analysis.unsafeSamples + response.data.analysis.criticalSamples) / response.data.analysis.totalSamples) * 100,
        metalConcentrations: {
          arsenic: 0.01, // These would come from the actual analysis
          lead: 0.005,
          mercury: 0.001,
          cadmium: 0.002,
          chromium: 0.05
        },
        sampleCount: response.data.analysis.totalSamples,
        lastUpdated: new Date().toISOString(),
        source: 'uploaded',
        dateRange: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
          endDate: new Date().toISOString().split('T')[0] // today
        },
        regions: ['Uploaded Data Region'], // This would be extracted from the actual file
        fileName: response.data.fileName
      };

      setUploadedData(waterQualityData);
      setCurrentView('uploaded');
      setUploadedFileName(response.data.fileName);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'File upload failed');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleBrowseFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    };
    input.click();
  };

  const handleOpenDetailedAnalysis = () => {
    navigate('/dashboard');
  };

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

  // Generate dynamic policy recommendations based on current data
  const generatePolicyRecommendations = () => {
    const recommendations = [];
    
    // Preventive Measures - Always include based on data quality
    if (currentData.avgHMPI > 70 && currentData.safeQuality > 75) {
      recommendations.push({
        type: 'Preventive Action',
        icon: CheckCircle,
        title: 'Preventive Monitoring Protocol',
        content: `Data shows good quality (HMPI: ${currentData.avgHMPI.toFixed(1)}, ${currentData.safeQuality.toFixed(1)}% safe samples). Proceed with: 1) Monthly sampling at current locations, 2) Establish baseline trends for seasonal variations, 3) Implement early warning system for quality degradation.`,
        priority: 'low'
      });
    } else if (currentData.avgHMPI >= 40 && currentData.avgHMPI <= 70) {
      recommendations.push({
        type: 'Preventive Action',
        icon: Clock,
        title: 'Enhanced Prevention Strategy',
        content: `Moderate quality indicators (HMPI: ${currentData.avgHMPI.toFixed(1)}) suggest preventive intervention. Proceed with: 1) Bi-weekly monitoring, 2) Source protection measures, 3) Pre-treatment system installation, 4) Community health impact assessment.`,
        priority: 'medium'
      });
    } else {
      recommendations.push({
        type: 'Immediate Action',
        icon: AlertTriangle,
        title: 'Critical Prevention Measures',
        content: `Poor quality data (HMPI: ${currentData.avgHMPI.toFixed(1)}) requires immediate preventive action. Proceed with: 1) Daily monitoring, 2) Alternative water source identification, 3) Emergency treatment protocols, 4) Public health advisory issuance.`,
        priority: 'high'
      });
    }

    // Data Analysis Procedure Recommendations
    const metalLimits = {
      arsenic: { limit: 0.01, name: 'Arsenic', treatment: 'coagulation-flocculation or adsorption systems' },
      lead: { limit: 0.01, name: 'Lead', treatment: 'corrosion control and pipe replacement' },
      mercury: { limit: 0.001, name: 'Mercury', treatment: 'activated carbon filtration' },
      cadmium: { limit: 0.003, name: 'Cadmium', treatment: 'reverse osmosis or ion exchange' },
      chromium: { limit: 0.05, name: 'Chromium', treatment: 'chemical reduction and precipitation' }
    };

    const exceedingMetals = [];
    Object.entries(metalLimits).forEach(([key, metal]) => {
      const value = currentData.metalConcentrations[key as keyof typeof currentData.metalConcentrations];
      if (value > metal.limit) {
        exceedingMetals.push({ 
          name: metal.name, 
          value, 
          limit: metal.limit, 
          ratio: (value / metal.limit).toFixed(1),
          treatment: metal.treatment
        });
      }
    });

    if (exceedingMetals.length > 0) {
      const worstMetal = exceedingMetals.reduce((worst, current) => 
        (current.value / current.limit) > (worst.value / worst.limit) ? current : worst
      );
      
      recommendations.push({
        type: 'Treatment Protocol',
        icon: XCircle,
        title: 'Contamination Treatment Procedure',
        content: `${worstMetal.name} exceeds limits by ${worstMetal.ratio}x. Proceed with: 1) Immediate source isolation, 2) Install ${worstMetal.treatment}, 3) Weekly post-treatment monitoring, 4) Health risk assessment for affected population, 5) Alternative supply arrangements during treatment.`,
        priority: 'high'
      });
    }

    // Data Quality and Sampling Procedure
    if (currentData.sampleCount < 50) {
      recommendations.push({
        type: 'Data Enhancement',
        icon: BarChart3,
        title: 'Sampling Procedure Enhancement',
        content: `Limited sample size (${currentData.sampleCount} samples). Proceed with: 1) Expand to minimum 100 samples for statistical significance, 2) Include seasonal variation data, 3) Add upstream/downstream sampling points, 4) Implement quality control duplicates (10% of samples).`,
        priority: 'medium'
      });
    } else if (currentData.unsafeCritical > 25) {
      recommendations.push({
        type: 'Data Validation',
        icon: Search,
        title: 'Data Verification Protocol',
        content: `High unsafe sample rate (${currentData.unsafeCritical.toFixed(1)}%). Proceed with: 1) Re-analyze 20% of samples for confirmation, 2) Investigate outlier locations, 3) Cross-validate with historical data, 4) Implement chain-of-custody procedures for future sampling.`,
        priority: 'high'
      });
    }

    // Regulatory and Compliance Procedures
    recommendations.push({
      type: 'Compliance Procedure',
      icon: FileText,
      title: 'Regulatory Compliance Steps',
      content: `Based on current data analysis, proceed with: 1) Prepare compliance report for local water board, 2) Schedule quarterly review meetings with health authorities, 3) Establish public disclosure protocols, 4) Create action plan timeline with measurable milestones, 5) Set up stakeholder communication framework.`,
      priority: 'medium'
    });

    // Long-term Preventive Strategy
    if (currentData.avgHMPI > 50) {
      recommendations.push({
        type: 'Long-term Prevention',
        icon: HelpCircle,
        title: 'Sustainable Management Protocol',
        content: `For long-term water quality sustainability, proceed with: 1) Develop 5-year monitoring plan, 2) Establish community-based water quality committees, 3) Create early warning indicators dashboard, 4) Implement source water protection zones, 5) Develop climate resilience strategies.`,
        priority: 'low'
      });
    }

    // Prioritize and return top 3 recommendations
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 3);
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Upload Groundwater Dataset */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">Upload groundwater dataset</CardTitle>
              <p className="text-muted-foreground">Upload groundwater data, get instant safety insights</p>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-light-blue-secondary"
                    : "border-gray-secondary hover:border-primary/50 bg-light-blue-secondary"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">Drag & drop your CSV or Excel file here</p>
                    <p className="text-muted-foreground">or</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleBrowseFiles}
                      className="btn-primary-enhanced"
                    >
                      Browse files
                    </Button>
                    <span className="text-sm text-muted-foreground">Supported: .csv, .xlsx</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Ensure columns include location, date, and metal concentration units (mg/L).
              </p>
              
              {/* Upload Error Display */}
              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    <strong>Upload Error:</strong> {uploadError}
                  </p>
                </div>
              )}
              
              {/* Success Display */}
              {uploadedFileName && currentView === 'uploaded' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">
                    <strong>File Processed Successfully:</strong> {uploadedFileName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation & Processing */}
          {isProcessing && (
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Validation & processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Parsing file, checking headers, validating ranges...</span>
                    <span className="text-primary font-semibold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Safe</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Unsafe</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Critical</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Water Safety Status - Only show when file is uploaded */}
          {currentView === 'uploaded' && (
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
                  <StatusIcon className={`w-6 h-6 ${waterStatus.color}`} />
                  <span>Water safety status</span>
                </CardTitle>
                <p className="text-gray-secondary">Computed using HMPI method (HMPI: {currentData.avgHMPI.toFixed(1)})</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className={`flex-1 h-8 ${waterStatus.bgColor} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">{waterStatus.status}</span>
                      </div>
                      <span className={`text-4xl font-bold ${waterStatus.color}`}>{waterStatus.status}</span>
                    </div>
                    <div className="text-sm text-gray-secondary mt-2">
                      {waterStatus.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Analysis & Reports */}
          <Card className="card-enhanced">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-foreground">
                    View detailed analysis with metal-wise breakdown, thresholds, and hotspots
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleOpenDetailedAnalysis}
                    className="btn-primary-enhanced"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Open Detailed Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Recommendations */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Policy Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatePolicyRecommendations().map((recommendation, index) => {
                  const IconComponent = recommendation.icon;
                  const priorityColors = {
                    high: 'bg-red-50 border-red-200',
                    medium: 'bg-yellow-50 border-yellow-200', 
                    low: 'bg-green-50 border-green-200'
                  };
                  const iconColors = {
                    high: 'text-red-600 bg-red-100',
                    medium: 'text-yellow-600 bg-yellow-100',
                    low: 'text-green-600 bg-green-100'
                  };
                  
                  return (
                    <div 
                      key={index} 
                      className={`rounded-lg p-4 flex items-start space-x-4 border ${priorityColors[recommendation.priority]}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[recommendation.priority]}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{recommendation.title}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {recommendation.type}
                          </span>
                        </div>
                        <p className="text-gray-secondary text-sm leading-relaxed">
                          {recommendation.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
  }