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
import BeachCameras from "@/components/surf/beach-cameras";
import LocationPermission from "@/components/location/location-permission";
import LoadingOverlay from "@/components/common/loading-overlay";
import PremiumFeaturesPanel from "@/components/premium/premium-features-panel";

import type { SurfSpot } from "@shared/schema";

export default function Home() {
  const [selectedSpotId, setSelectedSpotId] = useState(1); // Default to Bells Beach
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";

  const handleLocationShared = (latitude: number, longitude: number) => {
    setUserLocation({ lat: latitude, lng: longitude });
    setShowLocationPrompt(false);
    
    // Find closest surf spot and set as selected
    if (spots) {
      const distances = spots.map(spot => ({
        ...spot,
        distance: calculateDistance(latitude, longitude, spot.latitude, spot.longitude)
      }));
      const closestSpot = distances.reduce((prev, current) => 
        prev.distance < current.distance ? prev : current
      );
      setSelectedSpotId(closestSpot.id);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadian(lat2 - lat1);
    const dLon = toRadian(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadian = (value: number) => (value * Math.PI) / 180;

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
      
      <main className="max-w-md mx-auto px-4 pb-20 space-y-3">
        {showLocationPrompt && (
          <div className="fade-in">
            <LocationPermission 
              onLocationShared={handleLocationShared}
              onDismiss={() => setShowLocationPrompt(false)}
              showCompact={false}
            />
          </div>
        )}
        
        <div className="flex justify-between items-center slide-up">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedSpot?.name || "Surf Conditions"}
            </h2>
            <FavoriteButton 
              spotId={selectedSpotId} 
              userId={currentUserId}
              variant="icon"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            <CurrentConditions spotId={selectedSpotId} spot={selectedSpot} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.15s' }}>
            <PremiumFeaturesPanel />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <BeachCameras spotId={selectedSpotId} spotName={selectedSpot?.name} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.3s' }}>
            <TideInformation spotId={selectedSpotId} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.4s' }}>
            <ForecastTimeline spotId={selectedSpotId} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: '0.5s' }}>
            <SurfSpotsList spotId={selectedSpotId} />
          </div>
        </div>
      </main>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
