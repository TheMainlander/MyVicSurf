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
import type { SurfSpot, SurfCondition } from "@shared/schema";

interface SpotWithConditions extends SurfSpot {
  conditions?: SurfCondition;
}

export default function Spots() {
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
              <Card key={spot.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <img 
                      src={spot.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120"} 
                      alt={spot.name}
                      className="w-24 h-24 object-cover"
                    />
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{spot.name}</h3>
                          <p className="text-xs text-coastal-grey">{spot.region}</p>
                        </div>
                        <div className="flex items-center space-x-2">
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
                      </div>
                      
                      {spot.conditions && (
                        <div className="flex items-center justify-between text-xs text-coastal-grey">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <i className="fas fa-water text-ocean-blue mr-1"></i>
                              {spot.conditions.waveHeight}m
                            </span>
                            <span className="flex items-center">
                              <i className="fas fa-wind mr-1"></i>
                              {spot.conditions.windSpeed} km/h {spot.conditions.windDirection}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {spot.difficulty}
                          </Badge>
                        </div>
                      )}
                      
                      {spot.description && (
                        <p className="text-xs text-coastal-grey mt-2 line-clamp-2">
                          {spot.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                        <QuickShare spot={spot} conditions={spot.conditions} compact={true} />
                        <span className="text-xs text-coastal-grey">
                          Share this surf report
                        </span>
                      </div>
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
