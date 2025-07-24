import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LocationSelector from "@/components/common/location-selector";
import CurrentConditions from "@/components/surf/current-conditions";
import TideInformation from "@/components/surf/tide-information";
import ForecastTimeline from "@/components/surf/forecast-timeline";
import SurfSpotsList from "@/components/surf/surf-spots-list";
import FavoriteButton from "@/components/favorites/favorite-button";
import LoadingOverlay from "@/components/common/loading-overlay";
import type { SurfSpot } from "@shared/schema";

export default function Home() {
  const [selectedSpotId, setSelectedSpotId] = useState(1); // Default to Bells Beach
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";

  const { data: spots, isLoading: spotsLoading } = useQuery<SurfSpot[]>({
    queryKey: ["/api/surf-spots"],
  });

  const selectedSpot = spots?.find(spot => spot.id === selectedSpotId);

  if (spotsLoading) {
    return <LoadingOverlay message="Loading surf conditions..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <LocationSelector 
        selectedSpot={selectedSpot}
        spots={spots || []}
        onSpotChange={setSelectedSpotId}
      />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        <div className="flex justify-end mb-4">
          <FavoriteButton 
            spotId={selectedSpotId} 
            userId={currentUserId}
            variant="default"
          />
        </div>
        <CurrentConditions spotId={selectedSpotId} />
        <TideInformation spotId={selectedSpotId} />
        <ForecastTimeline spotId={selectedSpotId} />
        <SurfSpotsList spotId={selectedSpotId} />
      </main>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
