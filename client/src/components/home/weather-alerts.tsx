import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface WeatherAlert {
  id: number;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
}

const mockAlerts: WeatherAlert[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Strong Wind Warning',
    description: 'Winds 25-35 knots expected. Exercise caution when surfing.',
    timestamp: '2025-07-26T10:00:00'
  },
  {
    id: 2,
    type: 'info',
    title: 'Optimal Surf Conditions',
    description: 'Perfect offshore winds and 3-4ft swells forecast for afternoon.',
    timestamp: '2025-07-26T08:30:00'
  }
];

export default function WeatherAlerts() {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Weather Alerts</h3>
      {mockAlerts.map((alert) => (
        <Alert key={alert.id} className={getAlertClass(alert.type)}>
          <div className="flex items-start gap-2">
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
              <AlertDescription className="text-gray-700">
                {alert.description}
              </AlertDescription>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}