import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingOverlay from "@/components/common/loading-overlay";
import FavoriteButton from "@/components/favorites/favorite-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SurfSpot, SurfCondition } from "@shared/schema";

interface SpotWithConditions extends SurfSpot {
  conditions?: SurfCondition;
}

export default function Spots() {
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";
  
  const { data: spots, isLoading } = useQuery<SpotWithConditions[]>({
    queryKey: ["/api/surf-spots/1/nearby"],
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        <section className="py-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-map-marked-alt text-ocean-blue mr-2"></i>
            Victoria Surf Spots
          </h2>
          
          <div className="space-y-4">
            {spots?.map((spot) => (
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
