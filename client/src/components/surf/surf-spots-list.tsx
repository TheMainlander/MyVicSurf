import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuickShare from "@/components/social/quick-share";
import type { SurfSpot, SurfCondition } from "@shared/schema";

interface SpotWithConditions extends SurfSpot {
  conditions?: SurfCondition;
}

interface SurfSpotsListProps {
  spotId: number;
}

export default function SurfSpotsList({ spotId }: SurfSpotsListProps) {
  const { data: nearbySpots, isLoading } = useQuery<SpotWithConditions[]>({
    queryKey: ["/api/surf-spots", spotId, "nearby"],
    enabled: !!spotId,
  });

  if (isLoading) {
    return (
      <section className="py-2">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <i className="fas fa-map-marked-alt text-ocean-blue mr-2"></i>
          Nearby Spots
        </h3>
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="shadow-md overflow-hidden animate-pulse">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-200"></div>
                  <div className="flex-1 p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
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

  // Calculate mock distance (in real app, would use geolocation)
  const getMockDistance = (spotName: string) => {
    const distances: Record<string, number> = {
      "Torquay Point": 2.3,
      "Jan Juc": 4.1,
      "Winkipop": 1.8,
      "Bells Beach": 0.5
    };
    return distances[spotName] || Math.random() * 5 + 1;
  };

  return (
    <section className="py-2">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <i className="fas fa-map-marked-alt text-ocean-blue mr-2"></i>
        Nearby Spots
      </h3>
      <div className="space-y-2">
        {nearbySpots?.slice(0, 3).map((spot) => (
          <Card key={spot.id} className="shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 bg-white">
            <CardContent className="p-0">
              <div className="flex">
                <img 
                  src={spot.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120"} 
                  alt={spot.name}
                  className="w-24 h-24 object-cover"
                />
                <div className="flex-1 p-3 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-tight">{spot.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{spot.beachType || "Surf Coast"} • {spot.description || "World-class surf break"}</p>
                    </div>
                    {spot.conditions && (
                      <Badge className={`${getRatingColor(spot.conditions.rating)} text-white text-xs font-semibold px-2 py-1 rounded-full`}>
                        {getRatingText(spot.conditions.rating)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
                    <span className="font-medium">{getMockDistance(spot.name).toFixed(1)} km away</span>
                    {spot.conditions && (
                      <span className="font-medium text-ocean-blue">{spot.conditions.waveHeight.toFixed(1)}m surf</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Added {new Date().toLocaleDateString()}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <QuickShare spot={spot} conditions={spot.conditions} compact={true} />
                    <span className="text-xs text-gray-500">
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
  );
}