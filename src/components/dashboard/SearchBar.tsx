import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  return (
    <div className="w-full mb-8">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Ask AquaSafe about water quality data (e.g., 'Show arsenic levels in Delhi last week', 'Latest mercury trends...')"
          className="w-full h-14 pl-14 pr-32 text-lg bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        />
        <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 h-10 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" />
            <span>Search</span>
          </div>
        </Button>
      </div>
    </div>
  );
}