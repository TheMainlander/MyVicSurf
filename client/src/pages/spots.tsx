import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingOverlay from "@/components/common/loading-overlay";
import FavoriteButton from "@/components/favorites/favorite-button";
import QuickShare from "@/components/social/quick-share";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO, SEOConfigs } from "@/hooks/useSEO";
import type { SurfSpot, SurfCondition } from "@shared/schema";

interface SpotWithConditions extends SurfSpot {
  conditions?: SurfCondition;
}

export default function Spots() {
  // SEO optimization
  useSEO(SEOConfigs.spots);
  
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";
  
  const [selectedBeachType, setSelectedBeachType] = useState<string>("all");
  
  const { data: spots, isLoading } = useQuery<SpotWithConditions[]>({
    queryKey: ["/api/surf-spots/1/nearby"],
  });

  const { data: beachTypes } = useQuery({
    queryKey: ["/api/beach-types"],
  });

  if (isLoading) {
    return <LoadingOverlay message="Loading surf spots..." />;
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent": return "bg-green-500";
      case "very-good": return "bg-green-400";
      case "good": return "bg-wave-green";
      case "fair": return "bg-warning-orange";
      case "poor": return "bg-alert-red";
      default: return "bg-coastal-grey";
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case "very-good": return "Very Good";
      default: return rating.charAt(0).toUpperCase() + rating.slice(1);
    }
  };

  const filteredSpots = spots?.filter(spot => {
    if (selectedBeachType === "all") return true;
    return spot.beachType === selectedBeachType || spot.beachType === "both";
  });

  const getBeachTypeColor = (beachType: string) => {
    switch (beachType) {
      case "surf": return "bg-ocean-blue text-white";
      case "swimming": return "bg-wave-green text-white";
      case "both": return "bg-coastal-grey text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-orange-500";
      case "expert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        <section className="py-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-map-marked-alt text-ocean-blue mr-2"></i>
            Victoria Beaches & Surf Spots
          </h2>
          
          {/* Beach Type Filter */}
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedBeachType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBeachType("all")}
                className="text-xs"
              >
                All Beaches
              </Button>
              <Button
                variant={selectedBeachType === "surf" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBeachType("surf")}
                className="text-xs"
              >
                🏄 Surf Only
              </Button>
              <Button
                variant={selectedBeachType === "swimming" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBeachType("swimming")}
                className="text-xs"
              >
                🏊 Swimming Only
              </Button>
              <Button
                variant={selectedBeachType === "both" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBeachType("both")}
                className="text-xs"
              >
                🏄🏊 Both
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredSpots?.map((spot) => (
              <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Hero Image Section */}
                  <div className="relative">
                    <img 
                      src={spot.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"} 
                      alt={spot.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {spot.conditions && (
                        <Badge className={`${getRatingColor(spot.conditions.rating)} text-white text-xs`}>
                          {getRatingText(spot.conditions.rating)}
                        </Badge>
                      )}
                      <FavoriteButton 
                        spotId={spot.id} 
                        userId={currentUserId}
                        variant="icon"
                      />
                    </div>
                    
                    {/* Beach Type & Category Badges */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <Badge className={getBeachTypeColor(spot.beachType)}>
                        {spot.beachType}
                      </Badge>
                      {spot.beachCategory && (
                        <Badge variant="outline" className="bg-white/90 text-xs">
                          {spot.beachCategory.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{spot.name}</h3>
                        <p className="text-sm text-ocean-blue font-medium">{spot.region}</p>
                        <Badge className={`${getDifficultyColor(spot.difficulty)} text-white text-xs mt-1`}>
                          {spot.difficulty}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Current Conditions */}
                    {spot.conditions && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">CURRENT CONDITIONS</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <i className="fas fa-water text-ocean-blue block mb-1"></i>
                            <div className="font-medium">{spot.conditions.waveHeight}m</div>
                            <div className="text-gray-500">{spot.conditions.waveDirection}</div>
                          </div>
                          <div className="text-center">
                            <i className="fas fa-wind text-gray-600 block mb-1"></i>
                            <div className="font-medium">{Math.round(spot.conditions.windSpeed)} km/h</div>
                            <div className="text-gray-500">{spot.conditions.windDirection}</div>
                          </div>
                          <div className="text-center">
                            <i className="fas fa-thermometer-half text-orange-400 block mb-1"></i>
                            <div className="font-medium">{Math.round(spot.conditions.airTemperature)}°C</div>
                            <div className="text-gray-500">Air</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Beach Description */}
                    {spot.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {spot.description}
                      </p>
                    )}
                    
                    {/* Beach Facilities */}
                    {spot.facilities && spot.facilities.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">FACILITIES</h4>
                        <div className="flex flex-wrap gap-1">
                          {spot.facilities.slice(0, 4).map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                          {spot.facilities.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{spot.facilities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Access Information */}
                    {spot.accessInfo && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1">ACCESS</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{spot.accessInfo}</p>
                      </div>
                    )}
                    
                    {/* Best Conditions */}
                    {spot.bestConditions && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1">BEST CONDITIONS</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{spot.bestConditions}</p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-ocean-blue hover:bg-ocean-blue/90"
                        onClick={() => window.location.href = `/beach/${spot.id}`}
                      >
                        <i className="fas fa-chart-line mr-2 text-xs"></i>
                        View Details
                      </Button>
                      <QuickShare spot={spot} conditions={spot.conditions} variant="button" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation activeTab="spots" />
    </div>
  );
}
