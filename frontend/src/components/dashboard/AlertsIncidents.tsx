import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, Droplets, CheckCircle, XCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "High Arsenic Levels Detected",
    location: "Delhi Water Treatment Plant",
    timestamp: "2 hours ago",
    description: "Arsenic concentration exceeded 0.01 mg/L threshold",
    severity: "Critical",
    status: "active"
  },
  {
    id: 2,
    type: "warning",
    title: "Mercury Spike Alert",
    location: "Mumbai Industrial Zone",
    timestamp: "4 hours ago",
    description: "Mercury levels showing unusual increase pattern",
    severity: "Warning",
    status: "investigating"
  },
  {
    id: 3,
    type: "info",
    title: "Scheduled Maintenance",
    location: "Chennai Monitoring Station",
    timestamp: "1 day ago",
    description: "Regular sensor calibration completed successfully",
    severity: "Info",
    status: "resolved"
  },
  {
    id: 4,
    type: "critical",
    title: "Lead Contamination Detected",
    location: "Kolkata Residential Area",
    timestamp: "6 hours ago",
    description: "Lead levels 3x above permissible limits",
    severity: "Critical",
    status: "active"
  }
];

export function AlertsIncidents() {
  const { getCurrentData } = useData();
  const currentData = getCurrentData();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "info":
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <Badge variant="destructive">{severity}</Badge>;
      case "Warning":
        return <Badge variant="outline" className="text-warning border-warning">{severity}</Badge>;
      case "Info":
        return <Badge variant="outline" className="text-success border-success">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-high-contrast">Alerts & Incidents</h1>
          <p className="text-muted-high-contrast">Real-time water quality alerts and incident management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Clock className="w-4 h-4 mr-2" />
            Filter by Time
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="w-4 h-4 mr-2" />
            Filter by Location
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Critical Alerts</p>
                <p className="text-2xl font-bold text-high-contrast">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Warnings</p>
                <p className="text-2xl font-bold text-high-contrast">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Resolved</p>
                <p className="text-2xl font-bold text-high-contrast">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Total Incidents</p>
                <p className="text-2xl font-bold text-high-contrast">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-high-contrast">Recent Alerts</h2>
        {alerts.map((alert) => (
          <Card key={alert.id} className="card-enhanced">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-high-contrast">{alert.title}</h3>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-high-contrast mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </div>
                    </div>
                    <p className="text-sm text-muted-high-contrast">{alert.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {alert.status === "active" && (
                    <Button variant="destructive" size="sm">
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

