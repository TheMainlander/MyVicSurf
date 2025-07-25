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
                {useBOM ? "Live" : "Cache"}
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
                    <p>Semi-diurnal tides with lunar cycle variations included</p>
                  </div>
                )}

                {/* Enhanced Hourly Tide Report for Victorian Beaches */}
                {hourlyTides && hourlyTides.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-xl">⏰</span>
                        12-Hour Tide Timeline
                      </h3>
                      <div className="text-xs text-gray-500">
                        Victorian Coast
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                      {/* Time Labels */}
                      <div className="grid grid-cols-6 gap-4 mb-3">
                        {hourlyTides.slice(0, 6).map((hourly, index) => (
                          <div key={index} className="text-center">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              {String(hourly.hour).padStart(2, '0')}:00
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Tide Height Visualization */}
                      <div className="relative mb-4">
                        <div className="grid grid-cols-6 gap-4 items-end" style={{ height: '120px' }}>
                          {hourlyTides.slice(0, 6).map((hourly, index) => {
                            const maxHeight = Math.max(...hourlyTides.slice(0, 6).map(h => h.height));
                            const normalizedHeight = Math.max(20, (hourly.height / maxHeight) * 100);
                            return (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2 transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-sm"
                                  style={{ 
                                    height: `${normalizedHeight}%`,
                                    minHeight: '30px'
                                  }}
                                  title={`${hourly.height.toFixed(1)}m at ${String(hourly.hour).padStart(2, '0')}:00 - ${hourly.description}`}
                                ></div>
                                <div className="text-sm font-semibold text-gray-700">
                                  {hourly.height.toFixed(1)}m
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Horizontal reference lines */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute bottom-12 w-full border-t border-gray-200 opacity-50"></div>
                          <div className="absolute bottom-24 w-full border-t border-gray-300 opacity-30"></div>
                        </div>
                      </div>
                      
                      {/* Next 6 hours */}
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="grid grid-cols-6 gap-4 mb-3">
                          {hourlyTides.slice(6, 12).map((hourly, index) => (
                            <div key={index} className="text-center">
                              <div className="text-sm font-medium text-gray-600 mb-1">
                                {String(hourly.hour).padStart(2, '0')}:00
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-6 gap-4 items-end" style={{ height: '80px' }}>
                          {hourlyTides.slice(6, 12).map((hourly, index) => {
                            const maxHeight = Math.max(...hourlyTides.slice(6, 12).map(h => h.height));
                            const normalizedHeight = Math.max(15, (hourly.height / maxHeight) * 100);
                            return (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="w-6 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-t-lg mb-2 transition-all duration-500 hover:from-cyan-500 hover:to-cyan-400 cursor-pointer shadow-sm opacity-80"
                                  style={{ 
                                    height: `${normalizedHeight}%`,
                                    minHeight: '20px'
                                  }}
                                  title={`${hourly.height.toFixed(1)}m at ${String(hourly.hour).padStart(2, '0')}:00 - ${hourly.description}`}
                                ></div>
                                <div className="text-xs font-medium text-gray-600">
                                  {hourly.height.toFixed(1)}m
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-6 text-center space-y-2">
                        <div className="flex items-center justify-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                            <span className="text-gray-600">Next 6 hours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded opacity-80"></div>
                            <span className="text-gray-600">Hours 7-12</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Victorian coastline hourly tide heights with BOM data integration
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