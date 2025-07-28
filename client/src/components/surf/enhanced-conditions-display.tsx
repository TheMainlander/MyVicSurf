import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Waves, Wind, Thermometer, Eye, Cloud, Droplets, Lock, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { SurfCondition, User } from "@shared/schema";

interface EnhancedConditionsDisplayProps {
  conditions: SurfCondition;
  showAdvanced?: boolean;
}

export default function EnhancedConditionsDisplay({ 
  conditions, 
  showAdvanced = false 
}: EnhancedConditionsDisplayProps) {
  
  // Check user subscription status
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const isPremiumUser = user?.subscriptionPlan && ['wave_rider', 'surf_master'].includes(user.subscriptionPlan);
  
  // Premium features that require subscription
  const premiumFeatures = [
    'Professional 10-point scoring system',
    'Wave energy calculations',
    'Multi-swell analysis',
    'Swell quality classification',
    'Environmental metrics (UV, visibility, precipitation)',
    'Quality breakdown charts'
  ];
  
  const formatHeight = (heightMeters: number): string => {
    return `${heightMeters.toFixed(1)}m (${(heightMeters * 3.28).toFixed(1)}ft)`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 6) return "text-blue-600 bg-blue-50"; 
    if (score >= 4) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getEnergyLevel = (energy: number): string => {
    if (energy > 500) return "Massive";
    if (energy > 300) return "Powerful";
    if (energy > 150) return "Solid";
    if (energy > 50) return "Moderate";
    return "Small";
  };

  const getSwellQualityColor = (quality: string): string => {
    switch (quality) {
      case "excellent": return "bg-green-500";
      case "good": return "bg-blue-500";
      case "fair": return "bg-yellow-500";
      case "poor": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="surf-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-ocean-blue" />
            Current Conditions
          </span>
          {conditions.surfScore && (
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(conditions.surfScore)}`}>
              {conditions.surfScore}/10
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Wave Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Wave Height</div>
            <div className="text-2xl font-bold text-ocean-blue">
              {formatHeight(conditions.waveHeight)}
            </div>
            {conditions.swellHeight && (
              <div className="text-xs text-gray-500">
                Swell: {formatHeight(conditions.swellHeight)}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Wave Period</div>
            <div className="text-2xl font-bold">
              {conditions.wavePeriod?.toFixed(1)}s
            </div>
            {conditions.swellQuality && (
              <Badge className={`${getSwellQualityColor(conditions.swellQuality)} text-white text-xs`}>
                {conditions.swellQuality} swell
              </Badge>
            )}
          </div>
        </div>

        {/* Wave Energy & Type - Premium Feature */}
        {showAdvanced && conditions.waveEnergy && isPremiumUser && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Wave Energy</span>
              <span className="text-lg font-bold text-blue-600">
                {conditions.waveEnergy} units
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {getEnergyLevel(conditions.waveEnergy)} - {
                conditions.waveEnergy > 300 ? "Advanced surfers" :
                conditions.waveEnergy > 150 ? "Intermediate+" :
                conditions.waveEnergy > 50 ? "All levels" : "Beginners welcome"
              }
            </div>
          </div>
        )}

        {/* Multi-Swell Analysis - Premium Feature */}
        {showAdvanced && conditions.secondarySwellHeight && isPremiumUser && (
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium mb-2">Swell Components</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Primary: {formatHeight(conditions.primarySwellHeight || conditions.waveHeight)}</span>
                <span className="text-blue-600">{conditions.primarySwellDominance || 70}%</span>
              </div>
              {conditions.secondarySwellHeight && (
                <div className="flex justify-between">
                  <span>Secondary: {formatHeight(conditions.secondarySwellHeight)}</span>
                  <span className="text-blue-400">{conditions.secondarySwellDominance || 30}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wind Conditions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Wind</span>
          </div>
          <div className="text-right">
            <div className="font-medium">
              {conditions.windSpeed} km/h {conditions.windDirection}
            </div>
            {conditions.windQuality && showAdvanced && (
              <div className="text-xs text-gray-500">
                Quality: {conditions.windQuality.toFixed(1)}/10
              </div>
            )}
          </div>
        </div>

        {/* Environmental Conditions */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span>{conditions.airTemperature}°C</span>
          </div>
          
          {conditions.uvIndex && showAdvanced && isPremiumUser && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-yellow-500" />
              <span>UV {conditions.uvIndex}</span>
            </div>
          )}
          
          {conditions.precipitationProbability && showAdvanced && isPremiumUser && (
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>{conditions.precipitationProbability}%</span>
            </div>
          )}
        </div>

        {/* Professional Scoring Breakdown - Premium Feature */}
        {showAdvanced && conditions.waveQuality && isPremiumUser && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Quality Breakdown</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Waves</span>
                <span>{conditions.waveQuality.toFixed(1)}/10</span>
              </div>
              <Progress value={conditions.waveQuality * 10} className="h-1" />
              
              <div className="flex justify-between text-xs">
                <span>Wind</span>
                <span>{conditions.windQuality?.toFixed(1) || 5}/10</span>
              </div>
              <Progress value={(conditions.windQuality || 5) * 10} className="h-1" />
              
              {conditions.tideOptimal && (
                <>
                  <div className="flex justify-between text-xs">
                    <span>Tide</span>
                    <span>{conditions.tideOptimal.toFixed(1)}/10</span>
                  </div>
                  <Progress value={conditions.tideOptimal * 10} className="h-1" />
                </>
              )}
            </div>
          </div>
        )}

        {/* Premium Upgrade Prompt */}
        {showAdvanced && !isPremiumUser && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Professional Surf Metrics</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Unlock advanced forecasting with Wave Rider or Surf Master plans
            </p>
            <div className="space-y-1 text-xs text-blue-600 mb-3">
              {premiumFeatures.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Link href="/pricing">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}

        {/* Overall Rating */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm font-medium">Overall Rating</span>
          <Badge 
            className={`${
              conditions.rating === 'excellent' ? 'bg-green-500' :
              conditions.rating === 'very-good' ? 'bg-blue-500' :
              conditions.rating === 'good' ? 'bg-yellow-500' :
              conditions.rating === 'fair' ? 'bg-orange-500' :
              'bg-red-500'
            } text-white`}
          >
            {conditions.rating.replace('-', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}