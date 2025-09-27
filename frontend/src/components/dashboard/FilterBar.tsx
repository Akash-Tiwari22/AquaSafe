import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";

export function FilterBar() {
  const { getCurrentData } = useData();
  const currentData = getCurrentData();
  
  // Format date range for display
  const formatDateRange = () => {
    if (currentData.dateRange) {
      const startDate = new Date(currentData.dateRange.startDate).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      });
      const endDate = new Date(currentData.dateRange.endDate).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric' 
      });
      return `${startDate} - ${endDate}`;
    }
    return 'No date range available';
  };
  
  return (
    <Card className="p-4 mb-6 bg-card border-border">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Date Range</span>
          <Button variant="outline" size="sm" className="h-8">
            {formatDateRange()}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Index Selection</span>
          <Button variant="outline" size="sm" className="h-8">
            HMPI (Heavy Metal Pollution Index)
          </Button>
        </div>
      </div>
    </Card>
  );
}