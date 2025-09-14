import { Upload, FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false);

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
    // Handle file drop logic here
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Data Upload Portal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-4">
          Upload water quality data for analysis (CSV/Excel format)
        </div>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <FileSpreadsheet className="w-8 h-8 text-success" />
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="text-sm font-medium text-foreground">
              Drop files here or click to browse
            </div>
            <div className="text-xs text-muted-foreground">
              Supports .csv, .xlsx, .xls files up to 10MB
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              <Upload className="w-4 h-4 mr-2" />
              Select Files
            </Button>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <strong>For researchers & policymakers:</strong> Ensure data includes sample locations, metal concentrations, and collection dates
        </div>
      </CardContent>
    </Card>
  );
}