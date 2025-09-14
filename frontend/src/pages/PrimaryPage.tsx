import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, BarChart3, CheckCircle, Clock, FileText, HelpCircle, Search, Calendar, Filter, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorldMap from "@/components/maps/WorldMap";

export function PrimaryPage() {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

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
    handleFileUpload();
  };

  const handleFileUpload = () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate file processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleBrowseFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = handleFileUpload;
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

          {/* Water Safety Status */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-safe" />
                <span>Water safety status</span>
              </CardTitle>
              <p className="text-gray-secondary">Computed using HMPI method</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex-1 h-8 bg-gray-secondary rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div className="bg-safe flex-[3]"></div>
                        <div className="bg-unsafe flex-[1]"></div>
                        <div className="bg-critical flex-[0.5]"></div>
                      </div>
                    </div>
                    <span className="text-4xl font-bold text-safe">Safe</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-secondary">
                    <span>Safe</span>
                    <span>Unsafe</span>
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* India Water Quality Hotspots Map */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-primary" />
                <span>India Water Quality Hotspots</span>
              </CardTitle>
              <p className="text-gray-secondary">Interactive map showing water quality status across major Indian cities</p>
            </CardHeader>
            <CardContent>
              <WorldMap height="500px" />
            </CardContent>
          </Card>

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
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Summary
                  </Button>
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