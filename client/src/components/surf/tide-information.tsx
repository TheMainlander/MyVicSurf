import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TideTime } from "@shared/schema";

interface TideInformationProps {
  spotId: number;
}

export default function TideInformation({ spotId }: TideInformationProps) {
  const today = new Date().toISOString().split('T')[0];
  const [useBOM, setUseBOM] = useState(true); // Default to BOM data
  
  const { data: tides, isLoading, refetch } = useQuery<TideTime[]>({
    queryKey: ["/api/surf-spots", spotId, "tides", useBOM ? "bom" : "stored"],
    queryFn: async () => {
      const endpoint = useBOM 
        ? `/api/surf-spots/${spotId}/tides/bom`
        : `/api/surf-spots/${spotId}/tides`;
      const response = await fetch(endpoint);
      return response.json();
    },
    enabled: !!spotId,
  });

  // Fetch hourly tide report for Victorian beaches
  const { data: hourlyTides, isLoading: hourlyLoading } = useQuery<any[]>({
    queryKey: ["/api/surf-spots", spotId, "tides", "hourly"],
    queryFn: async () => {
      const response = await fetch(`/api/surf-spots/${spotId}/tides/hourly`);
      return response.json();
    },
    enabled: !!spotId,
  });

  const toggleDataSource = async () => {
    setUseBOM(!useBOM);
    // Refetch will happen automatically due to queryKey change
  };

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
            <p className="text-sm text-gray-600">
              {useBOM ? "Bureau of Meteorology data" : "Stored data"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={useBOM ? "default" : "outline"}
              size="sm"
              onClick={toggleDataSource}
              className="text-xs"
            >
              {useBOM ? "BOM Live" : "Stored"}
            </Button>
            <div className="glass-card p-2 rounded-lg">
              <div className={`text-sm font-medium ${useBOM ? 'text-green-600' : 'text-blue-600'}`}>
                {useBOM ? "🇦🇺 BOM" : "💾 Cache"}
              </div>
            </div>
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
              
              {/* Enhanced BOM Tide chart visualization */}
              <div className="space-y-4">
                <div className="h-24 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded-lg flex items-end justify-between px-3 pb-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-500/20 to-blue-400/10 rounded-lg"></div>
                  {tides.map((tide, index) => {
                    const maxHeight = Math.max(...tides.map(t => t.height));
                    const normalizedHeight = (tide.height / maxHeight) * 80 + 20;
                    return (
                      <div 
                        key={index}
                        className={`w-2 rounded-full transition-all duration-300 ${
                          tide.type === 'high' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ 
                          height: `${normalizedHeight}%`
                        }}
                        title={`${tide.type} tide: ${tide.height.toFixed(1)}m at ${formatTime(tide.time)}`}
                      ></div>
                    );
                  })}
                </div>
                
                {useBOM && (
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <p>🇦🇺 Authentic Bureau of Meteorology tide data for Victorian coast</p>
                    <p>Semi-diurnal tides with lunar cycle variations included</p>
                  </div>
                )}

                {/* Hourly Tide Report for Victorian Beaches */}
                {hourlyTides && hourlyTides.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-xl">⏰</span>
                      Hourly Victorian Tide Report
                    </h3>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                        {hourlyTides.slice(0, 12).map((hourly, index) => (
                          <div key={index} className="text-center">
                            <div className="text-xs font-medium text-gray-600">
                              {String(hourly.hour).padStart(2, '0')}:00
                            </div>
                            <div 
                              className="w-full bg-blue-200 rounded-full mt-1"
                              style={{ height: '30px' }}
                            >
                              <div 
                                className="bg-blue-500 rounded-full transition-all duration-300"
                                style={{ 
                                  height: '100%',
                                  width: `${Math.max(10, (hourly.height / 3) * 100)}%`
                                }}
                                title={`${hourly.height.toFixed(1)}m - ${hourly.description}`}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {hourly.height.toFixed(1)}m
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-600">
                          Victorian coastline hourly tide heights • Next 12 hours
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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