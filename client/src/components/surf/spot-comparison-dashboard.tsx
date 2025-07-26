import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Waves, Wind, Thermometer, Clock, TrendingUp, BarChart3, X, Plus } from "lucide-react";
import type { SurfSpot } from "@shared/schema";

interface SurfConditions {
  id: number;
  spotId: number;
  waveHeight: number;
  waveDirection: string;
  wavePeriod: number;
  windSpeed: number;
  windDirection: string;
  airTemperature: number;
  waterTemperature: number;
  rating: string;
  timestamp: string;
  swellPeriod?: number;
}

interface SurfForecast {
  id: number;
  spotId: number;
  date: string;
  waveHeight: number;
  waveDirection: string;
  windSpeed: number;
  windDirection: string;
  rating: string;
  airTemperature: number;
  waterTemperature: number;
}

interface SpotComparisonData {
  spot: SurfSpot;
  conditions: SurfConditions | null;
  forecast: SurfForecast[];
}

export default function SpotComparisonDashboard() {
  const [selectedSpots, setSelectedSpots] = useState<number[]>([1, 2]); // Default: Bells Beach, Torquay Point
  const [isMinimized, setIsMinimized] = useState(false);

  // Fetch all surf spots
  const { data: allSpots = [] } = useQuery({
    queryKey: ['/api/surf-spots'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/surf-spots');
      return await response.json() as SurfSpot[];
    }
  });

  // Fetch comparison data for selected spots
  const { data: comparisonData = [], isLoading } = useQuery({
    queryKey: ['/api/surf-spots/comparison', selectedSpots],
    queryFn: async () => {
      const promises = selectedSpots.map(async (spotId) => {
        const [spotResponse, conditionsResponse, forecastResponse] = await Promise.all([
          apiRequest('GET', `/api/surf-spots/${spotId}`),
          apiRequest('GET', `/api/surf-spots/${spotId}/conditions`).catch(() => null),
          apiRequest('GET', `/api/surf-spots/${spotId}/forecast`).catch(() => null)
        ]);

        const spot = await spotResponse.json();
        const conditions = conditionsResponse ? await conditionsResponse.json() : null;
        const forecast = forecastResponse ? await forecastResponse.json() : [];

        return { spot, conditions, forecast } as SpotComparisonData;
      });

      return Promise.all(promises);
    },
    enabled: selectedSpots.length > 0
  });

  const addSpot = (spotId: string) => {
    const id = parseInt(spotId);
    if (!selectedSpots.includes(id) && selectedSpots.length < 4) {
      setSelectedSpots([...selectedSpots, id]);
    }
  };

  const removeSpot = (spotId: number) => {
    if (selectedSpots.length > 1) {
      setSelectedSpots(selectedSpots.filter(id => id !== spotId));
    }
  };

  const getSurfQualityScore = (conditions: SurfConditions | null) => {
    if (!conditions) return 0;
    
    // Simple scoring algorithm based on wave height, wind, and swell period
    const waveScore = Math.min(conditions.waveHeight * 2, 10); // 5ft = 10 points
    const windScore = Math.max(10 - conditions.windSpeed, 0); // Lower wind = better
    const swellScore = Math.min((conditions.swellPeriod || conditions.wavePeriod || 8) / 2, 5); // Longer period = better
    
    return Math.round((waveScore + windScore + swellScore) / 3);
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    if (score >= 4) return "bg-orange-500";
    return "bg-red-500";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Poor";
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-ocean-blue hover:bg-ocean-blue/90 text-white shadow-lg"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Compare Spots ({selectedSpots.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-6xl mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-ocean-blue/20 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-ocean-blue" />
              <CardTitle className="text-lg">Spot Comparison</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Live Data
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Select onValueChange={addSpot}>
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue placeholder="Add spot" />
                </SelectTrigger>
                <SelectContent>
                  {allSpots
                    .filter(spot => !selectedSpots.includes(spot.id))
                    .map(spot => (
                      <SelectItem key={spot.id} value={spot.id.toString()}>
                        {spot.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-ocean-blue border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {comparisonData.map((data, index) => {
                const qualityScore = getSurfQualityScore(data.conditions);
                const nextForecast = data.forecast[0];
                
                return (
                  <div
                    key={data.spot.id}
                    className="relative border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow"
                  >
                    {selectedSpots.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpot(data.spot.id)}
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}

                    <div className="space-y-3">
                      {/* Spot Name & Quality */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {data.spot.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getQualityColor(qualityScore)}`}
                          />
                          <span className="text-xs text-gray-600">
                            {getQualityLabel(qualityScore)} ({qualityScore}/10)
                          </span>
                        </div>
                      </div>

                      {/* Current Conditions */}
                      {data.conditions ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <Waves className="h-3 w-3 text-blue-600" />
                              <span>Waves</span>
                            </div>
                            <span className="font-medium">
                              {data.conditions.waveHeight}ft
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <Wind className="h-3 w-3 text-gray-600" />
                              <span>Wind</span>
                            </div>
                            <span className="font-medium">
                              {data.conditions.windSpeed}mph {data.conditions.windDirection}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <Thermometer className="h-3 w-3 text-orange-600" />
                              <span>Water</span>
                            </div>
                            <span className="font-medium">
                              {data.conditions.waterTemperature}°C
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3 text-green-600" />
                              <span>Period</span>
                            </div>
                            <span className="font-medium">
                              {data.conditions.swellPeriod || data.conditions.wavePeriod || 'N/A'}s
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          No current conditions available
                        </div>
                      )}

                      {/* Next Forecast */}
                      {nextForecast && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>Next 6h</span>
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">
                              {nextForecast.waveHeight}ft
                            </span>
                            <span className="text-gray-500 ml-1">
                              {nextForecast.windSpeed}mph {nextForecast.windDirection}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={() => window.location.href = `/spots/${data.spot.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}