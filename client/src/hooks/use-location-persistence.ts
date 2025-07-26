import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  duration: string;
  expiresAt: number;
}

export function useLocationPersistence() {
  const [storedLocation, setStoredLocation] = useState<LocationData | null>(null);

  // Load stored location on mount
  useEffect(() => {
    loadStoredLocation();
  }, []);

  const loadStoredLocation = () => {
    try {
      const stored = localStorage.getItem('vicsurf-location-data');
      if (stored) {
        const locationData: LocationData = JSON.parse(stored);
        
        // Check if location has expired
        if (locationData.duration === 'session') {
          // Session storage - always valid until page reload
          setStoredLocation(locationData);
        } else if (locationData.duration === 'permanent') {
          // Permanent storage - never expires
          setStoredLocation(locationData);
        } else if (Date.now() < locationData.expiresAt) {
          // Time-based storage - check expiration
          setStoredLocation(locationData);
        } else {
          // Expired - clear it
          clearStoredLocation();
        }
      }
    } catch (error) {
      console.error('Failed to load stored location:', error);
      clearStoredLocation();
    }
  };

  const storeLocation = (
    latitude: number, 
    longitude: number, 
    duration: string
  ) => {
    const timestamp = Date.now();
    let expiresAt = timestamp;

    // Calculate expiration time based on duration
    switch (duration) {
      case 'session':
        expiresAt = timestamp + (24 * 60 * 60 * 1000); // 24 hours max for session
        break;
      case '1hour':
        expiresAt = timestamp + (60 * 60 * 1000); // 1 hour
        break;
      case '24hours':
        expiresAt = timestamp + (24 * 60 * 60 * 1000); // 24 hours
        break;
      case '7days':
        expiresAt = timestamp + (7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case '30days':
        expiresAt = timestamp + (30 * 24 * 60 * 60 * 1000); // 30 days
        break;
      case 'permanent':
        expiresAt = timestamp + (365 * 24 * 60 * 60 * 1000); // 1 year (effectively permanent)
        break;
      default:
        expiresAt = timestamp + (24 * 60 * 60 * 1000); // Default to 24 hours
    }

    const locationData: LocationData = {
      latitude,
      longitude,
      timestamp,
      duration,
      expiresAt
    };

    try {
      localStorage.setItem('vicsurf-location-data', JSON.stringify(locationData));
      setStoredLocation(locationData);
    } catch (error) {
      console.error('Failed to store location:', error);
    }
  };

  const clearStoredLocation = () => {
    try {
      localStorage.removeItem('vicsurf-location-data');
      setStoredLocation(null);
    } catch (error) {
      console.error('Failed to clear stored location:', error);
    }
  };

  const updateLocationDuration = (newDuration: string) => {
    if (storedLocation) {
      storeLocation(storedLocation.latitude, storedLocation.longitude, newDuration);
    }
  };

  const getLocationAge = (): string | null => {
    if (!storedLocation) return null;

    const ageMs = Date.now() - storedLocation.timestamp;
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    const ageHours = Math.floor(ageMinutes / 60);
    const ageDays = Math.floor(ageHours / 24);

    if (ageMinutes < 1) return 'Just now';
    if (ageMinutes < 60) return `${ageMinutes}m ago`;
    if (ageHours < 24) return `${ageHours}h ago`;
    return `${ageDays}d ago`;
  };

  const getExpirationInfo = (): string | null => {
    if (!storedLocation) return null;

    if (storedLocation.duration === 'permanent') {
      return 'Stored permanently';
    }

    if (storedLocation.duration === 'session') {
      return 'Stored for this session';
    }

    const timeLeft = storedLocation.expiresAt - Date.now();
    if (timeLeft <= 0) return 'Expired';

    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);

    if (daysLeft > 0) return `Expires in ${daysLeft}d`;
    if (hoursLeft > 0) return `Expires in ${hoursLeft}h`;
    
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    return `Expires in ${minutesLeft}m`;
  };

  const isLocationExpired = (): boolean => {
    if (!storedLocation) return true;
    if (storedLocation.duration === 'permanent' || storedLocation.duration === 'session') return false;
    return Date.now() >= storedLocation.expiresAt;
  };

  return {
    storedLocation,
    storeLocation,
    clearStoredLocation,
    updateLocationDuration,
    getLocationAge,
    getExpirationInfo,
    isLocationExpired,
    hasStoredLocation: !!storedLocation && !isLocationExpired()
  };
}