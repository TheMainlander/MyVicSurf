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
      <section>
        <div className="surf-card p-5">
          <div className="shimmer space-y-4">
            <div className="flex justify-between">
              <div className="h-12 bg-gray-200 rounded w-16 shimmer"></div>
              <div className="h-12 bg-gray-200 rounded w-16 shimmer"></div>
              <div className="h-12 bg-gray-200 rounded w-16 shimmer"></div>
            </div>
            <div className="h-20 bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
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
    <section>
      <div className="surf-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🌊</span>
              Tide Information
            </h2>
            <p className="text-sm text-gray-600">Today's tide schedule</p>
          </div>
          <div className="glass-card p-2 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">Live Data</div>
          </div>
        </div>
        
        <div>
          {tides && tides.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {tides.map((tide, index) => (
                  <div key={tide.id} className={`text-center p-4 rounded-lg transition-all duration-200 hover:scale-105 ${
                    tide.type === 'high' 
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
                  }`}>
                    <div className={`text-xs font-medium mb-1 capitalize ${
                      tide.type === 'high' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {tide.type === 'high' ? '⬆️ High' : '⬇️ Low'} Tide
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {formatTime(tide.time)}
                    </div>
                    <div className={`text-sm ${
                      tide.type === 'high' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {tide.height.toFixed(1)}m
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tide chart visualization */}
              <div className="h-20 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded-lg flex items-end justify-between px-2 pb-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-500/20 to-blue-400/10 rounded-lg"></div>
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
        </div>
      </div>
    </section>
  );
}