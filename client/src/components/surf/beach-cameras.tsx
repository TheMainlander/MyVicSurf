import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SurfSpot } from "@shared/schema";

interface BeachCamerasProps {
  spotId: number;
  spotName?: string;
}

interface CameraSource {
  id: string;
  name: string;
  provider: string;
  embedUrl?: string;
  imageUrl?: string;
  status: "live" | "offline" | "unavailable" | "available";
  lastUpdated?: string;
  description?: string;
  note?: string;
}

export default function BeachCameras({ spotId, spotName }: BeachCamerasProps) {
  const [selectedCamera, setSelectedCamera] = useState<CameraSource | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch available cameras for the spot
  const { data: cameras, isLoading } = useQuery<CameraSource[]>({
    queryKey: ["/api/surf-spots", spotId, "cameras"],
    queryFn: async () => {
      const response = await fetch(`/api/surf-spots/${spotId}/cameras`);
      if (!response.ok) {
        throw new Error('Failed to fetch cameras');
      }
      return response.json();
    },
    enabled: !!spotId,
  });

  // Get surf spot data for camera mapping
  const { data: spot } = useQuery<SurfSpot>({
    queryKey: ["/api/surf-spots", spotId],
    queryFn: async () => {
      const response = await fetch(`/api/surf-spots/${spotId}`);
      return response.json();
    },
    enabled: !!spotId,
  });

  useEffect(() => {
    if (cameras && cameras.length > 0 && !selectedCamera) {
      // Auto-select first available live camera
      const liveCamera = cameras.find(cam => cam.status === "live") || cameras[0];
      setSelectedCamera(liveCamera);
    }
  }, [cameras, selectedCamera]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // Force refetch the cameras data
    if (spotId) {
      fetch(`/api/surf-spots/${spotId}/cameras?refresh=true`)
        .then(response => response.json())
        .then(data => {
          // Update camera data and refresh selected camera
          if (data && data.length > 0) {
            const currentCamera = data.find((cam: any) => cam.id === selectedCamera?.id) || data[0];
            setSelectedCamera(currentCamera);
          }
        })
        .catch(error => console.error('Error refreshing cameras:', error));
    }
  };

  const getCameraStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-green-500";
      case "available": return "bg-blue-500";
      case "offline": return "bg-red-500";
      case "unavailable": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getCameraStatusText = (status: string) => {
    switch (status) {
      case "live": return "Live";
      case "available": return "Available";
      case "offline": return "Offline";
      case "unavailable": return "No Cam";
      default: return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <i className="fas fa-video text-ocean-blue"></i>
            Beach Cameras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <i className="fas fa-video text-ocean-blue"></i>
            Beach Cameras
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="text-xs"
            >
              <i className="fas fa-refresh mr-1"></i>
              Refresh
            </Button>
            {selectedCamera && (
              <Badge className={`${getCameraStatusColor(selectedCamera.status)} text-white text-xs`}>
                {getCameraStatusText(selectedCamera.status)}
              </Badge>
            )}
          </div>
        </div>
        {spotName && (
          <p className="text-sm text-gray-600">
            Live visual conditions for {spotName}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {cameras && cameras.length > 0 ? (
          <>
            {/* Camera Feed Display */}
            <div className="relative">
              {selectedCamera ? (
                <div className="space-y-3">
                  {selectedCamera.status === "live" && selectedCamera.embedUrl ? (
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <iframe
                        key={`${selectedCamera.id}-${refreshKey}`}
                        src={selectedCamera.embedUrl}
                        className="w-full h-full"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        title={`${selectedCamera.name} Live Camera`}
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        LIVE
                      </div>
                    </div>
                  ) : selectedCamera.imageUrl ? (
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        key={`${selectedCamera.id}-${refreshKey}`}
                        src={`${selectedCamera.imageUrl}?t=${Date.now()}`}
                        alt={`${selectedCamera.name} Camera`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Fallback to a generic surf image if camera feed fails
                          target.src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450";
                          // Update camera status to offline
                          if (selectedCamera) {
                            setSelectedCamera({...selectedCamera, status: "offline"});
                          }
                        }}
                      />
                      {selectedCamera.lastUpdated && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          Updated: {new Date(selectedCamera.lastUpdated).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-500" style={{ aspectRatio: '16/9' }}>
                      <div className="text-center">
                        <i className="fas fa-video-slash text-4xl mb-2"></i>
                        <p className="text-sm">Camera temporarily unavailable</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{selectedCamera.name}</span>
                      <span className="text-xs text-gray-500">via {selectedCamera.provider}</span>
                    </div>
                    {selectedCamera.description && (
                      <p className="text-xs text-gray-500 mt-1">{selectedCamera.description}</p>
                    )}
                    {selectedCamera.note && (
                      <p className="text-xs text-blue-600 mt-1 italic">{selectedCamera.note}</p>
                    )}
                    {selectedCamera.embedUrl && (
                      <div className="mt-2">
                        <a
                          href={selectedCamera.embedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View full camera feed on {selectedCamera.provider}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-500" style={{ aspectRatio: '16/9' }}>
                  <div className="text-center">
                    <i className="fas fa-video text-4xl mb-2"></i>
                    <p className="text-sm">No camera selected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Selection */}
            {cameras.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Available Cameras</h4>
                <div className="flex flex-wrap gap-2">
                  {cameras.map((camera) => (
                    <Button
                      key={camera.id}
                      variant={selectedCamera?.id === camera.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCamera(camera)}
                      className="text-xs flex items-center gap-1"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        camera.status === "live" ? "bg-green-400" : 
                        camera.status === "offline" ? "bg-red-400" : "bg-gray-400"
                      }`}></div>
                      {camera.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Camera Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>🎥 Visual surf conditions help assess wave quality, crowd levels, and water clarity</p>
              <p>📱 Professional surf camera feeds require premium subscriptions</p>
              <p>💰 Access live Swellnet feeds for $7.33/month • Surfline Pro for premium cameras</p>
              <p>🔗 Visit provider websites directly for full camera access</p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <i className="fas fa-video-slash text-4xl text-gray-300"></i>
            </div>
            <h3 className="font-medium text-gray-600 mb-2">No cameras available</h3>
            <p className="text-sm text-gray-500 mb-4">
              Camera feeds are not currently available for {spotName || 'this location'}
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Camera availability depends on local surf clubs and councils</p>
              <p>• Some cameras may require premium subscriptions from providers</p>
              <p>• Check back later as new cameras are added regularly</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}