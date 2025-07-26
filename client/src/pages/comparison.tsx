import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Waves, Wind, Thermometer, Clock, TrendingUp, BarChart3, X, Plus } from "lucide-react";
import { Link } from "wouter";
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

export default function Comparison() {
  const [selectedSpots, setSelectedSpots] = useState<number[]>([1, 2]); // Default: Bells Beach, Torquay Point

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
    if (!selectedSpots.includes(id) && selectedSpots.length < 6) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-ocean-blue" />
              <h1 className="text-2xl font-bold text-gray-900">Surf Spot Comparison</h1>
              <Badge variant="secondary" className="text-sm">
                Live Data
              </Badge>
            </div>
            <Select onValueChange={addSpot}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Add spot to compare" />
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
          </div>
          
          <p className="text-gray-600">
            Compare surf conditions across multiple spots to find the best waves. 
            Comparing {selectedSpots.length} spot{selectedSpots.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-ocean-blue border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonData.map((data, index) => {
              const qualityScore = getSurfQualityScore(data.conditions);
              const nextForecast = data.forecast[0];
              
              return (
                <Card key={data.spot.id} className="relative hover:shadow-lg transition-shadow">
                  {selectedSpots.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpot(data.spot.id)}
                      className="absolute top-3 right-3 h-8 w-8 p-0 text-gray-400 hover:text-red-500 z-10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  <CardHeader className="pb-4">
                    <div className="space-y-3">
                      <div>
                        <CardTitle className="text-lg text-gray-900 pr-8">
                          {data.spot.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{data.spot.region}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full ${getQualityColor(qualityScore)}`}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {getQualityLabel(qualityScore)} ({qualityScore}/10)
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Current Conditions */}
                    {data.conditions ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 text-sm">Current Conditions</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Waves className="h-4 w-4 text-blue-600" />
                              <span className="text-gray-600">Waves</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {data.conditions.waveHeight}ft
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Wind className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-600">Wind</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {data.conditions.windSpeed}mph
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Thermometer className="h-4 w-4 text-orange-600" />
                              <span className="text-gray-600">Water</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {data.conditions.waterTemperature}°C
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-gray-600">Period</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {data.conditions.swellPeriod || data.conditions.wavePeriod || 'N/A'}s
                            </span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-600">Wind Direction: </span>
                          <span className="font-medium text-gray-900">{data.conditions.windDirection}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                        No current conditions available
                      </div>
                    )}

                    {/* Next Forecast */}
                    {nextForecast && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Next 6 Hours</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Waves:</span>
                            <span className="font-medium text-gray-900">{nextForecast.waveHeight}ft</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Wind:</span>
                            <span className="font-medium text-gray-900">
                              {nextForecast.windSpeed}mph {nextForecast.windDirection}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Link href={`/spot/${data.spot.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        View Full Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Spot Card */}
        {selectedSpots.length < 6 && allSpots.length > selectedSpots.length && (
          <Card className="border-2 border-dashed border-gray-300 hover:border-ocean-blue transition-colors mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Add Another Spot</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Compare up to 6 surf spots to find the best conditions
              </p>
              <Select onValueChange={addSpot}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a spot" />
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
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation activeTab="comparison" />
    </div>
  );
}