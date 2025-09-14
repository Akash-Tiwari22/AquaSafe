import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Upload, Download, Trash2, RefreshCw, FileText, BarChart3, Settings } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const dataSources = [
  {
    name: "Water Quality Monitoring Stations",
    type: "Real-time Sensors",
    records: 1250,
    lastUpdate: "2 minutes ago",
    status: "active"
  },
  {
    name: "Laboratory Test Results",
    type: "Manual Upload",
    records: 340,
    lastUpdate: "1 hour ago",
    status: "active"
  },
  {
    name: "Historical Archive Data",
    type: "Legacy Database",
    records: 15600,
    lastUpdate: "1 day ago",
    status: "active"
  },
  {
    name: "External API Feed",
    type: "Third-party",
    records: 890,
    lastUpdate: "5 minutes ago",
    status: "warning"
  }
];

const dataOperations = [
  { name: "Data Validation", status: "completed", records: 1250, errors: 0 },
  { name: "Data Cleaning", status: "completed", records: 1250, errors: 12 },
  { name: "Data Enrichment", status: "in_progress", records: 800, errors: 0 },
  { name: "Data Aggregation", status: "pending", records: 0, errors: 0 }
];

export function DataManagement() {
  const { getCurrentData, uploadedData, clearUploadedData } = useData();
  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-high-contrast">Data Management</h1>
          <p className="text-muted-high-contrast">Data sources, processing, and quality management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Total Records</p>
                <p className="text-2xl font-bold text-high-contrast">18,080</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Data Sources</p>
                <p className="text-2xl font-bold text-high-contrast">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Data Quality</p>
                <p className="text-2xl font-bold text-high-contrast">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Errors</p>
                <p className="text-2xl font-bold text-high-contrast">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    source.status === "active" ? "bg-success" : "bg-warning"
                  }`} />
                  <div>
                    <h3 className="font-semibold text-high-contrast">{source.name}</h3>
                    <p className="text-sm text-muted-high-contrast">{source.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-high-contrast">{source.records.toLocaleString()}</div>
                    <div className="text-xs text-muted-high-contrast">records</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-high-contrast">Last update</div>
                    <div className="text-sm text-high-contrast">{source.lastUpdate}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Processing Pipeline */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast">Data Processing Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataOperations.map((operation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    operation.status === "completed" ? "bg-success" :
                    operation.status === "in_progress" ? "bg-warning" : "bg-muted-foreground"
                  }`} />
                  <span className="font-medium text-high-contrast">{operation.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={
                    operation.status === "completed" ? "default" :
                    operation.status === "in_progress" ? "outline" : "secondary"
                  }>
                    {operation.status}
                  </Badge>
                  <span className="text-sm text-muted-high-contrast">
                    {operation.records} records
                    {operation.errors > 0 && `, ${operation.errors} errors`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export/Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full btn-primary-enhanced">
                <Download className="w-4 h-4 mr-2" />
                Export All Data (CSV)
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Export Filtered Data
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Analytics Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Data Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV File
              </Button>
              <Button variant="outline" className="w-full">
                <Database className="w-4 h-4 mr-2" />
                Connect External Source
              </Button>
              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Real-time Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Data Status */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast">Current Data Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-high-contrast mb-3">Complete Dataset</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-high-contrast">Sample Count:</span>
                  <span className="text-sm font-semibold text-high-contrast">{currentData.sampleCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-high-contrast">Last Updated:</span>
                  <span className="text-sm font-semibold text-high-contrast">
                    {new Date(currentData.lastUpdated).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-high-contrast">Data Source:</span>
                  <span className="text-sm font-semibold text-high-contrast">Complete Dataset</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-high-contrast mb-3">Uploaded Data</h3>
              {uploadedData ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-high-contrast">Sample Count:</span>
                    <span className="text-sm font-semibold text-high-contrast">{uploadedData.sampleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-high-contrast">Last Updated:</span>
                    <span className="text-sm font-semibold text-high-contrast">
                      {new Date(uploadedData.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-high-contrast">Data Source:</span>
                    <span className="text-sm font-semibold text-high-contrast">Uploaded File</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={clearUploadedData}
                    className="mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Uploaded Data
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-high-contrast">No uploaded data available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

