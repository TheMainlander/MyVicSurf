import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { SurfCondition } from "@shared/schema";

interface CurrentConditionsProps {
  spotId: number;
}

export default function CurrentConditions({ spotId }: CurrentConditionsProps) {
  const { data: conditions, isLoading } = useQuery<SurfCondition>({
    queryKey: ["/api/surf-spots", spotId, "conditions"],
    enabled: !!spotId,
  });

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="bg-white rounded-2xl shadow-lg animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!conditions) {
    return (
      <section className="py-6">
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-coastal-grey">No current conditions available</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent": return "text-green-500";
      case "very-good": return "text-green-400";
      case "good": return "text-wave-green";
      case "fair": return "text-warning-orange";
      case "poor": return "text-alert-red";
      default: return "text-coastal-grey";
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case "very-good": return "Very Good";
      default: return rating.charAt(0).toUpperCase() + rating.slice(1);
    }
  };

  const getLastUpdated = () => {
    const now = new Date();
    const updated = new Date(conditions.timestamp);
    const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Updated just now";
    if (diffMinutes < 60) return `Updated ${diffMinutes} mins ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <section className="py-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div 
          className="relative h-48 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-semibold">Current Conditions</h2>
            <p className="text-sm opacity-90">{getLastUpdated()}</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-blue">
                {conditions.waveHeight.toFixed(1)}m
              </div>
              <div className="text-sm text-coastal-grey">Wave Height</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getRatingColor(conditions.rating)}`}>
                {getRatingText(conditions.rating)}
              </div>
              <div className="text-sm text-coastal-grey">Surf Rating</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <i className="fas fa-wind text-ocean-blue mb-1"></i>
              <div className="text-sm font-medium">
                {Math.round(conditions.windSpeed)} km/h
              </div>
              <div className="text-xs text-coastal-grey">
                {conditions.windDirection} Wind
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <i className="fas fa-thermometer-half text-coral mb-1"></i>
              <div className="text-sm font-medium">
                {Math.round(conditions.airTemperature)}°C
              </div>
              <div className="text-xs text-coastal-grey">Air Temp</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <i className="fas fa-water text-ocean-light mb-1"></i>
              <div className="text-sm font-medium">
                {Math.round(conditions.waterTemperature)}°C
              </div>
              <div className="text-xs text-coastal-grey">Water Temp</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}