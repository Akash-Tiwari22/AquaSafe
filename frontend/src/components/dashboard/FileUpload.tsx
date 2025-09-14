import { Upload, FileSpreadsheet, FileText, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { setUploadedData, setCurrentView, clearUploadedData } = useData();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      // Simulate file processing - in real app, this would parse CSV/Excel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate sample data based on uploaded file
      const sampleData = {
        avgHMPI: Math.random() * 20 + 60, // Random between 60-80
        safeQuality: Math.random() * 30 + 60, // Random between 60-90
        unsafeCritical: Math.random() * 40 + 10, // Random between 10-50
        metalConcentrations: {
          arsenic: Math.random() * 0.02 + 0.005,
          lead: Math.random() * 0.01 + 0.002,
          mercury: Math.random() * 0.002 + 0.0005,
          cadmium: Math.random() * 0.005 + 0.001,
          chromium: Math.random() * 0.1 + 0.02
        },
        sampleCount: Math.floor(Math.random() * 500) + 50,
        lastUpdated: new Date().toISOString(),
        source: 'uploaded' as const
      };

      setUploadedData(sampleData);
      setCurrentView('uploaded');
      setUploadedFile(file);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClearData = () => {
    clearUploadedData();
    setUploadedFile(null);
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Data Upload Portal
          </CardTitle>
          {uploadedFile && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                {uploadedFile.name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearData}
                className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-gray-500 mb-4">
          Upload water quality data for analysis (CSV/Excel format)
        </div>
        
        {isProcessing ? (
          <div className="border-2 border-dashed border-blue-500 bg-blue-50 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-sm font-medium text-gray-900">
                Processing your data...
              </div>
              <div className="text-xs text-gray-600">
                Analyzing water quality metrics
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {uploadedFile ? "File uploaded successfully!" : "Drop files here or click to browse"}
              </div>
              <div className="text-xs text-gray-600">
                Supports .csv, .xlsx, .xls files up to 10MB
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadedFile ? "Upload Another" : "Select Files"}
                  </label>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <strong>For researchers & policymakers:</strong> Ensure data includes sample locations, metal concentrations, and collection dates
        </div>
      </CardContent>
    </Card>
  );
}