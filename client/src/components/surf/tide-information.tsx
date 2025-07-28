import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Waves, Clock, TrendingUp, TrendingDown } from "lucide-react";
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
      <div className="surf-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Waves className="h-5 w-5 text-ocean-blue" />
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
                    <div className={`text-xs font-medium mb-1 capitalize flex items-center justify-center gap-1 ${
                      tide.type === 'high' ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {tide.type === 'high' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {tide.type === 'high' ? 'High' : 'Low'} Tide
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
              
              {/* Enhanced Tidal Curve Visualization */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-ocean-blue" />
                      Today's Tidal Pattern
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">High Tide</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-600">Low Tide</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-32 bg-white rounded-lg border border-blue-200 overflow-hidden">
                    {/* Tide curve visualization */}
                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                      {tides.map((tide, index) => {
                        const maxHeight = Math.max(...tides.map(t => t.height));
                        const minHeight = Math.min(...tides.map(t => t.height));
                        const heightRange = maxHeight - minHeight;
                        const normalizedHeight = heightRange > 0 
                          ? ((tide.height - minHeight) / heightRange) * 80 + 15
                          : 50;
                        
                        return (
                          <div key={index} className="flex flex-col items-center relative">
                            {/* Connecting line */}
                            {index < tides.length - 1 && (
                              <div 
                                className="absolute top-0 left-6 w-20 border-t-2 border-ocean-blue/40"
                                style={{ 
                                  transform: `translateY(-${normalizedHeight}%)`,
                                  transformOrigin: 'left center'
                                }}
                              />
                            )}
                            
                            {/* Tide point */}
                            <div 
                              className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-300 hover:scale-125 cursor-pointer ${
                                tide.type === 'high' 
                                  ? 'bg-blue-500 hover:bg-blue-600' 
                                  : 'bg-gray-400 hover:bg-gray-500'
                              }`}
                              style={{ 
                                marginBottom: `${normalizedHeight}%`
                              }}
                              title={`${tide.type === 'high' ? 'High' : 'Low'} tide: ${tide.height.toFixed(1)}m at ${formatTime(tide.time)}`}
                            />
                            
                            {/* Tide info */}
                            <div className="text-center mt-2">
                              <div className="text-xs font-semibold text-gray-700">
                                {formatTime(tide.time)}
                              </div>
                              <div className={`text-xs font-medium ${
                                tide.type === 'high' ? 'text-blue-600' : 'text-gray-600'
                              }`}>
                                {tide.height.toFixed(1)}m
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Grid lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute bottom-8 left-0 right-0 border-t border-gray-200 opacity-50"></div>
                      <div className="absolute bottom-16 left-0 right-0 border-t border-gray-200 opacity-30"></div>
                      <div className="absolute bottom-24 left-0 right-0 border-t border-gray-200 opacity-20"></div>
                    </div>
                  </div>
                  
                  {/* Current tide status */}
                  <div className="mt-4 p-3 bg-white/60 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="h-4 w-4 text-ocean-blue" />
                        <span className="text-sm font-medium text-gray-700">Current Status</span>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const now = new Date();
                          const currentTime = now.getHours() * 100 + now.getMinutes();
                          const nextTide = tides.find(tide => {
                            const tideTime = parseInt(tide.time.replace(':', ''));
                            return tideTime > currentTime;
                          });
                          
                          if (nextTide) {
                            const tideTime = parseInt(nextTide.time.replace(':', ''));
                            const timeDiff = Math.floor((tideTime - currentTime) / 100) * 60 + (tideTime - currentTime) % 100;
                            return (
                              <div className="text-sm">
                                <div className="font-semibold text-gray-800">
                                  Next {nextTide.type} tide in ~{Math.abs(timeDiff)}min
                                </div>
                                <div className="text-xs text-gray-600">
                                  {nextTide.height.toFixed(1)}m at {formatTime(nextTide.time)}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div className="text-sm text-gray-600">
                              Tide data available
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {useBOM && (
                  <div className="text-xs text-gray-500 text-center">
                    <p>Real-time Bureau of Meteorology data with lunar cycle variations</p>
                  </div>
                )}

                {/* Enhanced Hourly Tide Report for Victorian Beaches */}
                {hourlyTides && hourlyTides.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-ocean-blue" />
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
                      
                      {/* Tide Height Visualization - Next 6 Hours */}
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-500 rounded-full shadow-sm"></div>
                            <span className="text-sm font-semibold text-blue-800">Next 6 hours</span>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Current Period</span>
                          </div>
                          <div className="grid grid-cols-6 gap-3 items-end" style={{ height: '120px' }}>
                            {hourlyTides.slice(0, 6).map((hourly, index) => {
                              const slice = hourlyTides.slice(0, 6);
                              const maxHeight = Math.max(...slice.map(h => h.height));
                              const minHeight = Math.min(...slice.map(h => h.height));
                              const range = maxHeight - minHeight;
                              
                              // Create dramatic visual differences - use full 15%-95% range  
                              const normalizedHeight = range > 0 
                                ? ((hourly.height - minHeight) / range) * 80 + 15  // 15% to 95% range
                                : 50; // fallback if all heights are same
                              

                              
                              const isHigh = hourly.height > (maxHeight * 0.7);
                              return (
                                <div key={index} className="flex flex-col items-center">
                                  <div 
                                    className={`w-10 rounded-t-xl mb-2 transition-all duration-500 cursor-pointer shadow-md transform hover:scale-105 ${
                                      isHigh 
                                        ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 border-2 border-blue-300' 
                                        : 'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 border border-blue-200'
                                    }`}
                                    style={{ 
                                      height: `${normalizedHeight}%`
                                    }}
                                    title={`${hourly.height.toFixed(1)}m at ${String(hourly.hour).padStart(2, '0')}:00 - ${hourly.description}`}
                                  >
                                    {/* Height indicator dot */}
                                    <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                                      isHigh ? 'bg-white opacity-80' : 'bg-blue-100 opacity-60'
                                    }`}></div>
                                  </div>
                                  <div className={`text-sm font-bold ${isHigh ? 'text-blue-700' : 'text-blue-600'}`}>
                                    {hourly.height.toFixed(1)}m
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Horizontal reference lines */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute bottom-12 w-full border-t border-gray-200 opacity-50"></div>
                          <div className="absolute bottom-24 w-full border-t border-gray-300 opacity-30"></div>
                        </div>
                      </div>
                      
                      {/* Hours 7-12 - Extended Forecast */}
                      <div className="mt-6">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border-l-4 border-teal-400">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-full shadow-sm"></div>
                            <span className="text-sm font-semibold text-teal-800">Hours 7-12</span>
                            <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded-full">Extended View</span>
                          </div>
                          <div className="grid grid-cols-6 gap-3 mb-3">
                            {hourlyTides.slice(6, 12).map((hourly, index) => (
                              <div key={index} className="text-center">
                                <div className="text-sm font-medium text-teal-700 mb-1">
                                  {String(hourly.hour).padStart(2, '0')}:00
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-6 gap-3 items-end" style={{ height: '90px' }}>
                            {hourlyTides.slice(6, 12).map((hourly, index) => {
                              const slice = hourlyTides.slice(6, 12);
                              const maxHeight = Math.max(...slice.map(h => h.height));
                              const minHeight = Math.min(...slice.map(h => h.height));
                              const range = maxHeight - minHeight;
                              
                              // Create dramatic visual differences - use full 15%-95% range  
                              const normalizedHeight = range > 0 
                                ? ((hourly.height - minHeight) / range) * 80 + 15  // 15% to 95% range
                                : 50; // fallback if all heights are same
                              

                              
                              const isHigh = hourly.height > (maxHeight * 0.7);
                              return (
                                <div key={index} className="flex flex-col items-center">
                                  <div 
                                    className={`w-8 rounded-t-lg mb-2 transition-all duration-500 cursor-pointer shadow-sm transform hover:scale-105 ${
                                      isHigh 
                                        ? 'bg-gradient-to-t from-teal-500 via-teal-400 to-cyan-400 border-2 border-teal-300' 
                                        : 'bg-gradient-to-t from-teal-400 via-cyan-400 to-cyan-300 border border-teal-200'
                                    } opacity-85`}
                                    style={{ 
                                      height: `${normalizedHeight}%`
                                    }}
                                    title={`${hourly.height.toFixed(1)}m at ${String(hourly.hour).padStart(2, '0')}:00 - ${hourly.description}`}
                                  >
                                    {/* Striped pattern for extended forecast */}
                                    <div className="w-full h-1 bg-white opacity-30 mt-1"></div>
                                  </div>
                                  <div className={`text-sm font-semibold ${isHigh ? 'text-teal-700' : 'text-teal-600'}`}>
                                    {hourly.height.toFixed(1)}m
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-center space-y-3">
                        <div className="flex items-center justify-center gap-6 text-sm">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                            <div className="w-3 h-3 bg-gradient-to-t from-blue-600 to-blue-500 rounded-full shadow-sm"></div>
                            <span className="text-blue-800 font-medium">Next 6 hours</span>
                          </div>
                          <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
                            <div className="w-3 h-3 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-full shadow-sm"></div>
                            <span className="text-teal-800 font-medium">Hours 7-12</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
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