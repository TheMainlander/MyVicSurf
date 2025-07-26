import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle, CheckCircle, X, Clock } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useLocationPersistence } from '@/hooks/use-location-persistence';
import LocationPersistenceDialog from './location-persistence-dialog';

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
  const [showPersistenceDialog, setShowPersistenceDialog] = useState(false);
  const { 
    latitude, 
    longitude, 
    accuracy, 
    loading, 
    error, 
    supported, 
    getCurrentPosition 
  } = useGeolocation();
  
  const { 
    storedLocation, 
    storeLocation, 
    hasStoredLocation,
    getLocationAge,
    getExpirationInfo 
  } = useLocationPersistence();

  const handleRequestLocation = () => {
    setShowPersistenceDialog(true);
  };

  const handlePersistenceConfirm = (duration: string) => {
    setHasRequested(true);
    getCurrentPosition();
    
    // Store the duration preference for when we get coordinates
    sessionStorage.setItem('vicsurf-pending-duration', duration);
  };

  const handlePersistenceCancel = () => {
    setShowPersistenceDialog(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Call onLocationShared when we get coordinates and store them
  React.useEffect(() => {
    if (latitude && longitude) {
      const pendingDuration = sessionStorage.getItem('vicsurf-pending-duration') || '24hours';
      storeLocation(latitude, longitude, pendingDuration);
      sessionStorage.removeItem('vicsurf-pending-duration');
      
      if (onLocationShared) {
        onLocationShared(latitude, longitude);
      }
    }
  }, [latitude, longitude, onLocationShared, storeLocation]);

  // Use stored location if available
  React.useEffect(() => {
    if (hasStoredLocation && storedLocation && onLocationShared) {
      onLocationShared(storedLocation.latitude, storedLocation.longitude);
    }
  }, [hasStoredLocation, storedLocation, onLocationShared]);

  if (showCompact) {
    if (hasStoredLocation && storedLocation) {
      return (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <span className="text-sm text-green-800 block">
              Location shared • {getLocationAge()}
            </span>
            <span className="text-xs text-green-600">
              {getExpirationInfo()}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowPersistenceDialog(true)}
            className="text-green-700 border-green-300 hover:bg-green-100"
          >
            <Clock className="h-3 w-3 mr-1" />
            Update
          </Button>
        </div>
      );
    }

    return (
      <>
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
        <LocationPersistenceDialog
          isOpen={showPersistenceDialog}
          onClose={() => setShowPersistenceDialog(false)}
          onConfirm={handlePersistenceConfirm}
          onCancel={handlePersistenceCancel}
        />
      </>
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

        <LocationPersistenceDialog
          isOpen={showPersistenceDialog}
          onClose={() => setShowPersistenceDialog(false)}
          onConfirm={handlePersistenceConfirm}
          onCancel={handlePersistenceCancel}
        />
      </CardContent>
    </Card>
  );
}