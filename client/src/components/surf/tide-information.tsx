import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { TideTime } from "@shared/schema";

interface TideInformationProps {
  spotId: number;
}

export default function TideInformation({ spotId }: TideInformationProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: tides, isLoading } = useQuery<TideTime[]>({
    queryKey: ["/api/surf-spots", spotId, "tides"],
    enabled: !!spotId,
  });

  if (isLoading) {
    return (
      <section className="py-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="fas fa-chart-line text-ocean-blue mr-2"></i>
          Today's Tides
        </h3>
        <Card className="rounded-xl shadow-md">
          <CardContent className="p-5">
            <div className="animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-12 bg-gray-200 rounded w-16"></div>
                <div className="h-12 bg-gray-200 rounded w-16"></div>
                <div className="h-12 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <section className="py-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-chart-line text-ocean-blue mr-2"></i>
        Today's Tides
      </h3>
      <Card className="rounded-xl shadow-md">
        <CardContent className="p-5">
          {tides && tides.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                {tides.map((tide, index) => (
                  <div key={tide.id} className="text-center">
                    <div className="text-xs text-coastal-grey mb-1 capitalize">
                      {tide.type}
                    </div>
                    <div className="text-sm font-semibold">
                      {formatTime(tide.time)}
                    </div>
                    <div className="text-xs text-coastal-grey">
                      {tide.height.toFixed(1)}m
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tide chart visualization */}
              <div className="h-20 bg-gradient-to-r from-ocean-light/20 via-ocean-blue/30 to-ocean-light/20 rounded-lg flex items-end justify-between px-2 pb-2">
                {Array.from({ length: 7 }, (_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-ocean-blue rounded-full" 
                    style={{ 
                      height: `${20 + Math.random() * 60}%` 
                    }}
                  ></div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-coastal-grey">No tide data available for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}