import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, User, Save } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function Settings() {
  const { getCurrentData } = useData();
  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-high-contrast">Settings</h1>
          <p className="text-muted-high-contrast">Configure your AquaSafe dashboard preferences</p>
        </div>
        <Button className="btn-primary-enhanced">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name" className="text-sm font-medium text-high-contrast">
                Dashboard Name
              </Label>
              <Input
                id="dashboard-name"
                defaultValue="AquaSafe Water Quality Dashboard"
                className="bg-muted/20 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refresh-interval" className="text-sm font-medium text-high-contrast">
                Auto Refresh Interval
              </Label>
              <Select defaultValue="5">
                <SelectTrigger className="bg-muted/20 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium text-high-contrast">
              Timezone
            </Label>
            <Select defaultValue="ist">
              <SelectTrigger className="bg-muted/20 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern Time (EST)</SelectItem>
                <SelectItem value="pst">Pacific Time (PST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-alerts" className="text-sm font-medium text-high-contrast">
                Email Alerts
              </Label>
              <p className="text-xs text-muted-high-contrast">Receive email notifications for critical alerts</p>
            </div>
            <Switch id="email-alerts" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="text-sm font-medium text-high-contrast">
                Push Notifications
              </Label>
              <p className="text-xs text-muted-high-contrast">Browser push notifications for real-time alerts</p>
            </div>
            <Switch id="push-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-alerts" className="text-sm font-medium text-high-contrast">
                SMS Alerts
              </Label>
              <p className="text-xs text-muted-high-contrast">SMS notifications for critical incidents</p>
            </div>
            <Switch id="sms-alerts" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alert-threshold" className="text-sm font-medium text-high-contrast">
              Alert Threshold
            </Label>
            <Select defaultValue="medium">
              <SelectTrigger className="bg-muted/20 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (All alerts)</SelectItem>
                <SelectItem value="medium">Medium (Warning and Critical)</SelectItem>
                <SelectItem value="high">High (Critical only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Settings */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="data-retention" className="text-sm font-medium text-high-contrast">
                Data Retention Period
              </Label>
              <Select defaultValue="2">
                <SelectTrigger className="bg-muted/20 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="5">5 years</SelectItem>
                  <SelectItem value="10">10 years</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency" className="text-sm font-medium text-high-contrast">
                Backup Frequency
              </Label>
              <Select defaultValue="daily">
                <SelectTrigger className="bg-muted/20 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-backup" className="text-sm font-medium text-high-contrast">
                Automatic Backup
              </Label>
              <p className="text-xs text-muted-high-contrast">Automatically backup data at scheduled intervals</p>
            </div>
            <Switch id="auto-backup" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-validation" className="text-sm font-medium text-high-contrast">
                Real-time Data Validation
              </Label>
              <p className="text-xs text-muted-high-contrast">Validate incoming data for accuracy and completeness</p>
            </div>
            <Switch id="data-validation" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-sm font-medium text-high-contrast">
                Theme
              </Label>
              <Select defaultValue="aqua-dark">
                <SelectTrigger className="bg-muted/20 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aqua-dark">Aqua Dark (Current)</SelectItem>
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chart-style" className="text-sm font-medium text-high-contrast">
                Chart Style
              </Label>
              <Select defaultValue="modern">
                <SelectTrigger className="bg-muted/20 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations" className="text-sm font-medium text-high-contrast">
                Enable Animations
              </Label>
              <p className="text-xs text-muted-high-contrast">Smooth transitions and hover effects</p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compact-mode" className="text-sm font-medium text-high-contrast">
                Compact Mode
              </Label>
              <p className="text-xs text-muted-high-contrast">Reduce spacing for more data visibility</p>
            </div>
            <Switch id="compact-mode" />
          </div>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-high-contrast">
                Username
              </Label>
              <Input
                id="username"
                defaultValue="admin@aquasafe.com"
                className="bg-muted/20 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-high-contrast">
                Role
              </Label>
              <Select defaultValue="admin">
                <SelectTrigger className="bg-muted/20 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="analyst">Data Analyst</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization" className="text-sm font-medium text-high-contrast">
              Organization
            </Label>
            <Input
              id="organization"
              defaultValue="AquaSafe Water Quality Monitoring"
              className="bg-muted/20 border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor" className="text-sm font-medium text-high-contrast">
                Two-Factor Authentication
              </Label>
              <p className="text-xs text-muted-high-contrast">Add an extra layer of security to your account</p>
            </div>
            <Switch id="two-factor" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="session-timeout" className="text-sm font-medium text-high-contrast">
                Auto Logout
              </Label>
              <p className="text-xs text-muted-high-contrast">Automatically log out after period of inactivity</p>
            </div>
            <Switch id="session-timeout" defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-policy" className="text-sm font-medium text-high-contrast">
              Password Policy
            </Label>
            <Select defaultValue="strong">
              <SelectTrigger className="bg-muted/20 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                <SelectItem value="strong">Strong (12+ characters, mixed case, numbers)</SelectItem>
                <SelectItem value="enterprise">Enterprise (16+ characters, special chars)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

