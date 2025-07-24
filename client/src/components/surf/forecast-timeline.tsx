import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Forecast } from "@shared/schema";

interface ForecastTimelineProps {
  spotId: number;
}

export default function ForecastTimeline({ spotId }: ForecastTimelineProps) {
  const { data: forecast, isLoading } = useQuery<Forecast[]>({
    queryKey: ["/api/surf-spots", spotId, "forecast"],
    enabled: !!spotId,
  });

  if (isLoading) {
    return (
      <section className="py-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="fas fa-calendar-alt text-ocean-blue mr-2"></i>
          7-Day Forecast
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="shadow-md animate-pulse">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
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
    <section className="py-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-calendar-alt text-ocean-blue mr-2"></i>
        7-Day Forecast
      </h3>
      <div className="space-y-3">
        {forecast?.slice(0, 3).map((day, index) => {
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
                      <span className="text-sm font-medium">
                        {day.waveHeight.toFixed(1)}m
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <i className="fas fa-wind text-coastal-grey text-sm"></i>
                      <div className="text-xs text-coastal-grey">
                        {Math.round(day.windSpeed)} km/h {day.windDirection}
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
  );
}