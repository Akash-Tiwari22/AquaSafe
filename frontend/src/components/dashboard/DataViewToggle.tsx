import { Button } from "@/components/ui/button";
import { Database, Upload } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

export function DataViewToggle() {
  const { currentView, setCurrentView, uploadedData } = useData();

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
      <Button
        variant={currentView === 'complete' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrentView('complete')}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          currentView === 'complete' ? "btn-primary-enhanced" : "hover:bg-gray-200"
        )}
      >
        <Database className="w-4 h-4" />
        Complete Data
      </Button>
      <Button
        variant={currentView === 'uploaded' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setCurrentView('uploaded')}
        disabled={!uploadedData}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          currentView === 'uploaded' ? "btn-primary-enhanced" : "hover:bg-gray-200",
          !uploadedData && "opacity-50 cursor-not-allowed"
        )}
      >
        <Upload className="w-4 h-4" />
        Uploaded Data
      </Button>
    </div>
  );
}
