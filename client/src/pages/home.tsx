import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LocationSelector from "@/components/common/location-selector";
import CurrentConditions from "@/components/surf/current-conditions";
import TideInformation from "@/components/surf/tide-information";
import ForecastTimeline from "@/components/surf/forecast-timeline";
import SurfSpotsList from "@/components/surf/surf-spots-list";
import LoadingOverlay from "@/components/common/loading-overlay";
import type { SurfSpot } from "@shared/schema";

export default function Home() {
  const [selectedSpotId, setSelectedSpotId] = useState(1); // Default to Bells Beach

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
        <CurrentConditions spotId={selectedSpotId} />
        <TideInformation spotId={selectedSpotId} />
        <ForecastTimeline spotId={selectedSpotId} />
        <SurfSpotsList spotId={selectedSpotId} />
      </main>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
