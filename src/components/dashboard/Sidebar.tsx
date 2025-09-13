import { cn } from "@/lib/utils";
import { 
  Home,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Database,
  Settings,
  Droplets
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard Overview", icon: Home, current: true },
  { name: "Alerts & Incidents", icon: AlertTriangle, current: false },
  { name: "Historical Trends", icon: TrendingUp, current: false },
  { name: "Predictive Models", icon: BarChart3, current: false },
  { name: "Data Management", icon: Database, current: false },
  { name: "Settings", icon: Settings, current: false },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex h-full w-64 flex-col bg-card border-r border-border", className)}>
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
          <Droplets className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">AquaSafe</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href="#"
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </a>
          );
        })}
      </nav>
    </div>
  );
}