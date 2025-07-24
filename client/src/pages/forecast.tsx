import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LocationSelector from "@/components/common/location-selector";
import LoadingOverlay from "@/components/common/loading-overlay";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SurfSpot, Forecast } from "@shared/schema";

export default function Forecast() {
  const [selectedSpotId, setSelectedSpotId] = useState(1);

  const { data: spots, isLoading: spotsLoading } = useQuery<SurfSpot[]>({
    queryKey: ["/api/surf-spots"],
  });

  const { data: forecast, isLoading: forecastLoading } = useQuery<Forecast[]>({
    queryKey: ["/api/surf-spots", selectedSpotId, "forecast"],
    enabled: !!selectedSpotId,
  });

  const selectedSpot = spots?.find(spot => spot.id === selectedSpotId);

  if (spotsLoading || forecastLoading) {
    return <LoadingOverlay message="Loading forecast..." />;
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return { name: "Today", date: date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { name: "Tomorrow", date: date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) };
    } else {
      return { 
        name: date.toLocaleDateString('en-AU', { weekday: 'long' }), 
        date: date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) 
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <LocationSelector 
        selectedSpot={selectedSpot}
        spots={spots || []}
        onSpotChange={setSelectedSpotId}
      />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        <section className="py-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-calendar-alt text-ocean-blue mr-2"></i>
            7-Day Forecast
          </h2>
          
          <div className="space-y-3">
            {forecast?.map((day, index) => {
              const dateInfo = formatDate(day.date);
              return (
                <Card key={`${day.spotId}-${day.date}`} className="shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[60px]">
                          <div className="text-sm font-medium">{dateInfo.name}</div>
                          <div className="text-xs text-coastal-grey">{dateInfo.date}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-water text-ocean-blue"></i>
                          <span className="text-sm font-medium">{day.waveHeight.toFixed(1)}m</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <i className="fas fa-wind text-coastal-grey text-sm"></i>
                          <div className="text-xs text-coastal-grey">
                            {Math.round(day.windSpeed)} km/h {day.windDirection}
                          </div>
                        </div>
                        <div className="text-center">
                          <i className="fas fa-thermometer-half text-coral text-sm"></i>
                          <div className="text-xs text-coastal-grey">
                            {Math.round(day.airTemperature)}°C
                          </div>
                        </div>
                        <Badge className={`${getRatingColor(day.rating)} text-white text-xs`}>
                          {getRatingText(day.rating)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNavigation activeTab="forecast" />
    </div>
  );
}
