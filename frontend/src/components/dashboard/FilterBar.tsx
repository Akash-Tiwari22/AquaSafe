import { Calendar, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FilterBar() {
  return (
    <Card className="p-4 mb-6 bg-card border-border">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Date Range</span>
          <Button variant="outline" size="sm" className="h-8">
            Mon Jan 01 2024 - Thu Dec 05 2024
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Index Selection</span>
          <Button variant="outline" size="sm" className="h-8">
            HMPI (Heavy Metal Pollution Index)
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Region Selection</span>
          <Button variant="outline" size="sm" className="h-8">
            Maharashtra
          </Button>
        </div>
      </div>
    </Card>
  );
}