import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SurfSpot } from "@shared/schema";

interface LocationSelectorProps {
  selectedSpot?: SurfSpot;
  spots: SurfSpot[];
  onSpotChange: (spotId: number) => void;
}

export default function LocationSelector({ selectedSpot, spots, onSpotChange }: LocationSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSpotChange = (value: string) => {
    try {
      const spotId = parseInt(value);
      if (!isNaN(spotId)) {
        onSpotChange(spotId);
      }
    } catch (error) {
      console.error("Error changing spot:", error);
    }
    setShowPicker(false);
  };

  // Don't render if spots are not loaded
  if (!spots || spots.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <i className="fas fa-map-marker-alt text-ocean-blue"></i>
            <span className="text-lg font-medium text-gray-500">Loading locations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className="fas fa-map-marker-alt text-ocean-blue"></i>
          <span className="text-lg font-medium">
            {selectedSpot?.name || "Select Location"}
          </span>
        </div>
        
        {showPicker ? (
          <Select 
            value={selectedSpot?.id.toString()} 
            onValueChange={handleSpotChange}
            onOpenChange={(open) => !open && setShowPicker(false)}
            open={true}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {spots && spots.length > 0 ? (
                spots.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id.toString()}>
                    {spot.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-locations" disabled>
                  No locations available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        ) : (
          <Button 
            variant="secondary"
            size="sm"
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            onClick={() => setShowPicker(true)}
          >
            <span className="text-sm text-coastal-grey">Change</span>
            <i className="fas fa-chevron-down text-xs text-coastal-grey"></i>
          </Button>
        )}
      </div>
    </div>
  );
}
