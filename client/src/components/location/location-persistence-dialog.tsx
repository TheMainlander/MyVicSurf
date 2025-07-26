import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Shield, Info } from 'lucide-react';

interface LocationPersistenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: string) => void;
  onCancel: () => void;
}

export interface LocationPersistenceOptions {
  duration: string;
  label: string;
  description: string;
  icon: string;
}

export const PERSISTENCE_OPTIONS: LocationPersistenceOptions[] = [
  {
    duration: 'session',
    label: 'This Session Only',
    description: 'Location cleared when you close the app',
    icon: '🔒'
  },
  {
    duration: '1hour',
    label: '1 Hour',
    description: 'Location saved for 1 hour',
    icon: '⏰'
  },
  {
    duration: '24hours',
    label: '24 Hours',
    description: 'Location saved for 1 day',
    icon: '📅'
  },
  {
    duration: '7days',
    label: '7 Days',
    description: 'Location saved for 1 week',
    icon: '🗓️'
  },
  {
    duration: '30days',
    label: '30 Days',
    description: 'Location saved for 1 month',
    icon: '📆'
  },
  {
    duration: 'permanent',
    label: 'Until I Clear It',
    description: 'Location saved until manually cleared',
    icon: '♾️'
  }
];

export default function LocationPersistenceDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel 
}: LocationPersistenceDialogProps) {
  const [selectedDuration, setSelectedDuration] = useState<string>('24hours');

  const handleConfirm = () => {
    onConfirm(selectedDuration);
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const selectedOption = PERSISTENCE_OPTIONS.find(opt => opt.duration === selectedDuration);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Location Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Choose how long you'd like VicSurf to remember your location for personalized surf recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Storage Duration</Label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
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

          {selectedOption && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Info className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {selectedOption.label}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {selectedOption.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-100 rounded-full">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Privacy Protected
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Your location is stored securely on your device and can be cleared anytime in Settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Don't Share Location
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
            <Clock className="h-4 w-4 mr-2" />
            Share for {selectedOption?.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}