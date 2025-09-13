import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Ask AquaSafe about water quality data (e.g., 'Show arsenic levels in Delhi last week', 'Latest salt...')"
          className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
        Search
      </Button>
    </div>
  );
}