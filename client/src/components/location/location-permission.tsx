import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';

interface LocationPermissionProps {
  onLocationShared?: (latitude: number, longitude: number) => void;
  onDismiss?: () => void;
  showCompact?: boolean;
}

export default function LocationPermission({ 
  onLocationShared, 
  onDismiss,
  showCompact = false 
}: LocationPermissionProps) {
  const [hasRequested, setHasRequested] = useState(false);
  const { 
    latitude, 
    longitude, 
    accuracy, 
    loading, 
    error, 
    supported, 
    getCurrentPosition 
  } = useGeolocation();

  const handleRequestLocation = () => {
    setHasRequested(true);
    getCurrentPosition();
  };

  // Call onLocationShared when we get coordinates
  React.useEffect(() => {
    if (latitude && longitude && onLocationShared) {
      onLocationShared(latitude, longitude);
    }
  }, [latitude, longitude, onLocationShared]);

  if (showCompact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-800 flex-1">
          Share your location for nearby surf spots
        </span>
        <Button 
          size="sm" 
          onClick={handleRequestLocation}
          disabled={loading || !supported}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Getting...' : 'Share'}
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-blue-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Find Nearby Surf Spots</CardTitle>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!supported && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">
              Location sharing is not supported in this browser
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">{error}</span>
          </div>
        )}

        {latitude && longitude && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Location shared successfully!
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <div className="font-mono text-gray-900">{latitude.toFixed(6)}</div>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <div className="font-mono text-gray-900">{longitude.toFixed(6)}</div>
              </div>
            </div>
            {accuracy && (
              <Badge variant="outline" className="w-fit">
                Accuracy: ±{Math.round(accuracy)}m
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Share your location to discover surf spots near you and get personalized conditions.
          </p>
          
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Find closest surf breaks</li>
            <li>• Get accurate travel times</li>
            <li>• Personalized surf alerts</li>
            <li>• Your location is never stored permanently</li>
          </ul>

          <Button 
            onClick={handleRequestLocation}
            disabled={loading || !supported}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {loading ? 'Getting Location...' : hasRequested ? 'Try Again' : 'Share My Location'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}