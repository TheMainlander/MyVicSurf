import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import CurrentConditions from "@/components/surf/current-conditions";
import TideInformation from "@/components/surf/tide-information";
import ForecastTimeline from "@/components/surf/forecast-timeline";
import BeachCameras from "@/components/surf/beach-cameras";
import FavoriteButton from "@/components/favorites/favorite-button";
import LoadingOverlay from "@/components/common/loading-overlay";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Info, AlertTriangle } from "lucide-react";
import type { SurfSpot } from "@shared/schema";

export default function Spot() {
  const { id } = useParams();
  const spotId = parseInt(id || "1");
  
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";

  const { data: spot, isLoading: spotLoading } = useQuery<SurfSpot>({
    queryKey: [`/api/surf-spots/${spotId}`],
    enabled: !!spotId
  });

  if (spotLoading || !spot) {
    return <LoadingOverlay message="Loading surf spot details..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-20 space-y-6">
        {/* Spot Header */}
        <div className="fade-in pt-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{spot.name}</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{spot.region}</span>
                <Badge variant="outline" className="text-xs">
                  {spot.difficulty}
                </Badge>
              </div>
            </div>
            <FavoriteButton 
              spotId={spotId} 
              userId={currentUserId}
              variant="icon"
            />
          </div>
          
          {spot.description && (
            <p className="text-gray-700 text-sm mt-3 leading-relaxed">
              {spot.description}
            </p>
          )}
        </div>

        {/* Beach Information */}
        <div className="fade-in" style={{ animationDelay: '0.1s' }}>
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="h-4 w-4 text-ocean-blue" />
                <h3 className="font-semibold text-gray-900">Beach Information</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Beach Type:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {spot.beachType?.replace('_', ' ') || 'Surf Beach'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {spot.beachCategory?.replace('_', ' ') || 'Surf Beach'}
                  </span>
                </div>

                {spot.facilities && spot.facilities.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">Facilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {spot.facilities.map((facility, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {spot.accessInfo && (
                  <div>
                    <span className="text-gray-600 block mb-1">Access:</span>
                    <span className="text-gray-900 text-xs">{spot.accessInfo}</span>
                  </div>
                )}

                {spot.bestConditions && (
                  <div>
                    <span className="text-gray-600 block mb-1">Best Conditions:</span>
                    <span className="text-gray-900 text-xs">{spot.bestConditions}</span>
                  </div>
                )}

                {spot.hazards && spot.hazards.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-gray-600 text-xs">Hazards:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {spot.hazards.map((hazard, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {hazard}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Conditions */}
        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
          <CurrentConditions spotId={spotId} spot={spot} />
        </div>
        
        {/* Beach Cameras */}
        <div className="fade-in" style={{ animationDelay: '0.3s' }}>
          <BeachCameras spotId={spotId} spotName={spot.name} />
        </div>
        
        {/* Tide Information */}
        <div className="fade-in" style={{ animationDelay: '0.4s' }}>
          <TideInformation spotId={spotId} />
        </div>
        
        {/* Forecast Timeline */}
        <div className="fade-in" style={{ animationDelay: '0.5s' }}>
          <ForecastTimeline spotId={spotId} />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}