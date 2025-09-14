import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Brain, TrendingUp, AlertTriangle, RefreshCw, Download } from "lucide-react";
import { useData } from "@/contexts/DataContext";

const models = [
  {
    name: "HMPI Prediction Model",
    accuracy: 94.2,
    status: "active",
    lastTrained: "2 hours ago",
    predictions: {
      nextWeek: 87,
      nextMonth: 89,
      nextQuarter: 92
    }
  },
  {
    name: "Arsenic Contamination Predictor",
    accuracy: 91.8,
    status: "active",
    lastTrained: "4 hours ago",
    predictions: {
      nextWeek: 0.003,
      nextMonth: 0.002,
      nextQuarter: 0.001
    }
  },
  {
    name: "Lead Level Forecasting",
    accuracy: 88.5,
    status: "training",
    lastTrained: "1 hour ago",
    predictions: {
      nextWeek: 0.001,
      nextMonth: 0.0008,
      nextQuarter: 0.0005
    }
  }
];

const riskFactors = [
  { factor: "Industrial Discharge", impact: "High", probability: 0.75 },
  { factor: "Agricultural Runoff", impact: "Medium", probability: 0.45 },
  { factor: "Urban Pollution", impact: "High", probability: 0.68 },
  { factor: "Seasonal Variations", impact: "Low", probability: 0.25 },
  { factor: "Infrastructure Age", impact: "Medium", probability: 0.55 }
];

export function PredictiveModels() {
  const { getCurrentData } = useData();
  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-high-contrast">Predictive Models</h1>
          <p className="text-muted-high-contrast">AI-powered water quality forecasting and risk assessment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retrain Models
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Predictions
          </Button>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Active Models</p>
                <p className="text-2xl font-bold text-high-contrast">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-high-contrast">Avg Accuracy</p>
                <p className="text-2xl font-bold text-high-contrast">91.5%</p>
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
                <p className="text-sm text-muted-high-contrast">Risk Alerts</p>
                <p className="text-2xl font-bold text-high-contrast">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Models */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-high-contrast">AI Prediction Models</h2>
        {models.map((model, index) => (
          <Card key={index} className="card-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {model.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={model.status === "active" ? "default" : "outline"}>
                    {model.status}
                  </Badge>
                  <span className="text-sm text-muted-high-contrast">Accuracy: {model.accuracy}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold text-primary">Next Week</div>
                  <div className="text-sm text-muted-high-contrast">
                    {typeof model.predictions.nextWeek === 'number' && model.predictions.nextWeek < 1 
                      ? `${model.predictions.nextWeek} mg/L` 
                      : model.predictions.nextWeek}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold text-primary">Next Month</div>
                  <div className="text-sm text-muted-high-contrast">
                    {typeof model.predictions.nextMonth === 'number' && model.predictions.nextMonth < 1 
                      ? `${model.predictions.nextMonth} mg/L` 
                      : model.predictions.nextMonth}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold text-primary">Next Quarter</div>
                  <div className="text-sm text-muted-high-contrast">
                    {typeof model.predictions.nextQuarter === 'number' && model.predictions.nextQuarter < 1 
                      ? `${model.predictions.nextQuarter} mg/L` 
                      : model.predictions.nextQuarter}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-high-contrast">
                <span>Last trained: {model.lastTrained}</span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Assessment */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Factor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskFactors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    factor.impact === "High" ? "bg-destructive" :
                    factor.impact === "Medium" ? "bg-warning" : "bg-success"
                  }`} />
                  <span className="font-medium text-high-contrast">{factor.factor}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={
                    factor.impact === "High" ? "destructive" :
                    factor.impact === "Medium" ? "outline" : "default"
                  }>
                    {factor.impact} Impact
                  </Badge>
                  <span className="text-sm text-muted-high-contrast">
                    Probability: {(factor.probability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Predictions Chart */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-high-contrast">6-Month Water Quality Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🔮</div>
              <div className="text-sm text-muted-high-contrast">AI-Powered Prediction Chart</div>
              <div className="text-xs text-success">Forecast: Continued improvement expected</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-success">+5</div>
              <div className="text-xs text-muted-high-contrast">Expected HMPI Rise</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">-0.002</div>
              <div className="text-xs text-muted-high-contrast">Arsenic Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">-0.001</div>
              <div className="text-xs text-muted-high-contrast">Lead Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">2</div>
              <div className="text-xs text-muted-high-contrast">Risk Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

