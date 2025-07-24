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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
      <Header />
      
      <div className="fade-in">
        <LocationSelector 
          selectedSpot={selectedSpot}
          spots={spots || []}
          onSpotChange={setSelectedSpotId}
        />
      </div>
      
      <main className="max-w-md mx-auto px-4 pb-20 space-y-6">
        <div className="flex justify-end slide-up">
          <FavoriteButton 
            spotId={selectedSpotId} 
            userId={currentUserId}
            variant="default"
          />
        </div>
        
        <div className="space-y-6">
          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            <CurrentConditions spotId={selectedSpotId} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <TideInformation spotId={selectedSpotId} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.3s' }}>
            <ForecastTimeline spotId={selectedSpotId} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.4s' }}>
            <SurfSpotsList spotId={selectedSpotId} />
          </div>
        </div>
      </main>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
