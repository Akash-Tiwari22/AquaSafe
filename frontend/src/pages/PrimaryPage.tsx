import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, BarChart3, CheckCircle, Clock, FileText, HelpCircle, Search, Calendar, Filter, AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { apiService, type WaterQualityData } from "@/services/api";

export function PrimaryPage() {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
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
        source: 'uploaded'
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

          {/* Insights & Tips */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Insights & Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-light-blue-secondary rounded-lg p-4 flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-teal-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Tip:</p>
                    <p className="text-gray-secondary">
                      Outliers in Pb, Cd, Cr(VI) drive HMPI most strongly. Verify sampling points with anomalies.
                    </p>
                  </div>
                </div>
                
                <div className="bg-light-blue-secondary rounded-lg p-4 flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-teal-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Trend:</p>
                    <p className="text-gray-secondary">
                      Consider seasonal trends: compare pre- and post-monsoon datasets for robust assessment.
                    </p>
                  </div>
                </div>
                
                <div className="bg-light-blue-secondary rounded-lg p-4 flex items-start space-x-4">
                  <div className="w-8 h-8 bg-teal-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-teal-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Compliance:</p>
                    <p className="text-gray-secondary">
                      Export a compliance report mapped to WHO and local standards after review.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}