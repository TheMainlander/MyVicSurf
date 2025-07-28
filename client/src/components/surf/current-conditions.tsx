import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/social/share-button";
import EnhancedConditionsDisplay from "./enhanced-conditions-display";
import { Wind, Thermometer, Droplets, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { SurfCondition, SurfSpot } from "@shared/schema";

interface CurrentConditionsProps {
  spotId: number;
  spot?: SurfSpot;
}

export default function CurrentConditions({ spotId, spot }: CurrentConditionsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { data: conditions, isLoading } = useQuery<SurfCondition>({
    queryKey: ["/api/surf-spots", spotId, "conditions"],
    enabled: !!spotId,
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const isPremiumUser = user?.subscriptionPlan && ['wave_rider', 'surf_master'].includes(user.subscriptionPlan);

  if (isLoading) {
    return (
      <section>
        <div className="surf-card">
          <div className="h-48 bg-gray-200 rounded-t-xl shimmer"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
            <div className="h-8 bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!conditions) {
    return (
      <section className="py-6">
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-secondary">No current conditions available</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent": return "text-green-500";
      case "very-good": return "text-green-400";
      case "good": return "text-wave-green";
      case "fair": return "text-warning-orange";
      case "poor": return "text-alert-red";
      default: return "text-coastal-grey";
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case "very-good": return "Very Good";
      default: return rating.charAt(0).toUpperCase() + rating.slice(1);
    }
  };

  const getLastUpdated = () => {
    const now = new Date();
    const updated = new Date(conditions.timestamp);
    const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Updated just now";
    if (diffMinutes < 60) return `Updated ${diffMinutes} mins ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <section className="space-y-3">
      {/* Professional Conditions Display */}
      <EnhancedConditionsDisplay 
        conditions={conditions} 
        showAdvanced={showAdvanced} 
      />
      
      {/* Toggle Advanced Metrics */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs gap-1.5"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {showAdvanced ? 'Hide' : 'Show'} Professional Metrics
          {!isPremiumUser && <span className="ml-1 text-blue-600">💎</span>}
        </Button>
      </div>
      
      {/* Legacy Display (kept for fallback) */}
      <div className="surf-card overflow-hidden group" style={{ display: showAdvanced ? 'none' : 'block' }}>
        <div 
          className="relative h-48 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 transition-all duration-300 group-hover:scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute top-4 right-4">
            <div className="glass-card rounded-lg px-3 py-1">
              <span className="text-white text-sm font-medium">
                🌊 Current Conditions
              </span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <div className={`text-3xl font-bold text-white wave-animation`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(0,0,0,0.6)' }}>
              {getRatingText(conditions.rating)}
            </div>
            <p className="text-sm text-white font-medium" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{getLastUpdated()}</p>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {conditions.waveHeight.toFixed(1)}m
              </div>
              <div className="text-sm text-gray-600 font-medium">Wave Height</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getRatingColor(conditions.rating)}`}>
                {getRatingText(conditions.rating)}
              </div>
              <div className="text-sm text-gray-600 font-medium">Surf Rating</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center hover:scale-105 transition-all duration-200">
              <div className="flex justify-center mb-2">
                <Wind className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-blue-700">
                {Math.round(conditions.windSpeed)} km/h
              </div>
              <div className="text-xs text-blue-600 font-medium">
                {conditions.windDirection} Wind
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 text-center hover:scale-105 transition-all duration-200">
              <div className="flex justify-center mb-2">
                <Thermometer className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-sm font-bold text-orange-800">
                {Math.round(conditions.airTemperature)}°C
              </div>
              <div className="text-xs text-orange-600 font-medium">Air Temp</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 text-center hover:scale-105 transition-all duration-200">
              <div className="flex justify-center mb-2">
                <Droplets className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="text-sm font-bold text-cyan-800">
                {Math.round(conditions.waterTemperature)}°C
              </div>
              <div className="text-xs text-cyan-600 font-medium">Water Temp</div>
            </div>
          </div>
          
          {/* Social Sharing */}
          {spot && (
            <div className="flex justify-center pt-3 border-t border-gray-100">
              <ShareButton 
                spot={spot}
                conditions={conditions}
                className="text-ocean-blue border-ocean-blue/30 hover:bg-ocean-blue/10 hover:border-ocean-blue/50"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}