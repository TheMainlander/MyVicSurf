import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function APISettings() {
  const [useRealAPI, setUseRealAPI] = useState(() => {
    const saved = localStorage.getItem('vicsurf-use-real-api');
    return saved ? JSON.parse(saved) : true; // Default to real API
  });

  useEffect(() => {
    localStorage.setItem('vicsurf-use-real-api', JSON.stringify(useRealAPI));
  }, [useRealAPI]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <i className="fas fa-cog text-ocean-blue mr-2"></i>
          Data Source Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="real-api" className="text-sm font-medium">
              Real-time Data
            </Label>
            <p className="text-xs text-coastal-grey">
              Use live surf forecast data from Open-Meteo Marine API
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="real-api"
              checked={useRealAPI}
              onCheckedChange={setUseRealAPI}
            />
            <Badge variant={useRealAPI ? "default" : "secondary"} className="text-xs">
              {useRealAPI ? "Live" : "Demo"}
            </Badge>
          </div>
        </div>
        
        {useRealAPI && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <i className="fas fa-satellite-dish text-green-600 text-sm"></i>
              <span className="text-sm text-green-700 font-medium">Live Data Active</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Fetching real-time surf conditions for Victoria coastline
            </p>
          </div>
        )}
        
        {!useRealAPI && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <i className="fas fa-play-circle text-blue-600 text-sm"></i>
              <span className="text-sm text-blue-700 font-medium">Demo Mode</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Using demonstration data for app testing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook to get the current API setting
export function useRealAPI() {
  const [useRealAPI, setUseRealAPI] = useState(() => {
    const saved = localStorage.getItem('vicsurf-use-real-api');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('vicsurf-use-real-api');
      setUseRealAPI(saved ? JSON.parse(saved) : true);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check for changes every second (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return useRealAPI;
}