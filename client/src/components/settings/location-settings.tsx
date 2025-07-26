import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Shield, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { useLocationPersistence } from '@/hooks/use-location-persistence';
import { PERSISTENCE_OPTIONS } from '../location/location-persistence-dialog';

export default function LocationSettings() {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>('24hours');
  
  const { 
    storedLocation, 
    updateLocationDuration,
    clearStoredLocation,
    hasStoredLocation,
    getLocationAge,
    getExpirationInfo 
  } = useLocationPersistence();

  const handleUpdateDuration = () => {
    updateLocationDuration(selectedDuration);
    setShowUpdateDialog(false);
  };

  const handleClearLocation = () => {
    clearStoredLocation();
  };

  const currentOption = storedLocation ? 
    PERSISTENCE_OPTIONS.find(opt => opt.duration === storedLocation.duration) : 
    null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Location Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasStoredLocation && storedLocation ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Location Active
                  </p>
                  <p className="text-xs text-green-700">
                    Shared {getLocationAge()} • {getExpirationInfo()}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                {currentOption?.icon} {currentOption?.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <div className="font-mono text-gray-900 text-xs">
                  {storedLocation.latitude.toFixed(6)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <div className="font-mono text-gray-900 text-xs">
                  {storedLocation.longitude.toFixed(6)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Update Duration
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Location Duration</DialogTitle>
                    <DialogDescription>
                      Change how long VicSurf remembers your location.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">New Duration</Label>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PERSISTENCE_OPTIONS.map((option) => (
                            <SelectItem key={option.duration} value={option.duration}>
                              <div className="flex items-center gap-2">
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateDuration}>
                      Update Duration
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearLocation}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Location
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              No Location Stored
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Share your location to get personalized surf recommendations
            </p>
            <Button size="sm" variant="outline" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Share Location from Main Page
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Privacy Protected
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Your location is stored locally on your device and never shared with third parties. 
                You can clear it anytime.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}