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
  currentView: string;
  onViewChange: (view: string) => void;
}

const navigation = [
  { name: "Dashboard Overview", icon: Home, view: "dashboard" },
  { name: "Alerts & Incidents", icon: AlertTriangle, view: "alerts" },
  { name: "Historical Trends", icon: TrendingUp, view: "trends" },
  { name: "Predictive Models", icon: BarChart3, view: "predictive" },
  { name: "Data Management", icon: Database, view: "data" },
  { name: "Settings", icon: Settings, view: "settings" },
];

export function Sidebar({ className, currentView, onViewChange }: SidebarProps) {
  return (
    <div className={cn("fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-white border-r border-gray-200 shadow-lg", className)}>
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">AquaSafe</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.name}
              onClick={() => onViewChange(item.view)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 w-full text-left",
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}