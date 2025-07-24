// Real surf forecast API integrations
import type { SurfCondition, Forecast, TideTime } from "@shared/schema";

// Open-Meteo Marine API - Free and reliable for Victoria coastline
const OPEN_METEO_BASE = "https://marine-api.open-meteo.com/v1/marine";

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly_units: {
    time: string;
    wave_height: string;
    wave_direction: string;
    wave_period: string;
    wind_wave_height: string;
    swell_wave_height: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
  };
  hourly: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
    wind_wave_height: number[];
    swell_wave_height: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
  };
}

// Convert degrees to compass direction
function degreesToCompass(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Calculate surf rating based on conditions
function calculateSurfRating(waveHeight: number, windSpeed: number, waveDirection: number, windDirection: number): string {
  let score = 0;
  
  // Wave height scoring
  if (waveHeight >= 1.5 && waveHeight <= 3.0) score += 3;
  else if (waveHeight >= 1.0 && waveHeight <= 4.0) score += 2;
  else if (waveHeight >= 0.5 && waveHeight <= 5.0) score += 1;
  
  // Wind scoring (offshore is better)
  const windDiff = Math.abs(windDirection - waveDirection);
  const isOffshore = windDiff > 90 && windDiff < 270;
  
  if (windSpeed < 10 && isOffshore) score += 2;
  else if (windSpeed < 15) score += 1;
  else if (windSpeed > 25) score -= 1;
  
  // Return rating
  if (score >= 4) return "excellent";
  if (score >= 3) return "very-good";
  if (score >= 2) return "good";
  if (score >= 1) return "fair";
  return "poor";
}

export async function fetchOpenMeteoForecast(latitude: number, longitude: number): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: [
      "wave_height",
      "wave_direction", 
      "wave_period",
      "wind_wave_height",
      "swell_wave_height",
      "wind_speed_10m",
      "wind_direction_10m"
    ].join(','),
    timezone: "Australia/Melbourne",
    forecast_days: "7"
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function getCurrentConditionsFromAPI(spotId: number, latitude: number, longitude: number): Promise<Partial<SurfCondition>> {
  try {
    const data = await fetchOpenMeteoForecast(latitude, longitude);
    
    // Get current hour data (first entry)
    const currentIndex = 0;
    const waveHeight = data.hourly.wave_height[currentIndex];
    const waveDirection = data.hourly.wave_direction[currentIndex];
    const wavePeriod = data.hourly.wave_period[currentIndex];
    const windSpeed = data.hourly.wind_speed_10m[currentIndex];
    const windDirection = data.hourly.wind_direction_10m[currentIndex];
    
    // Convert wind speed from m/s to km/h
    const windSpeedKmh = windSpeed * 3.6;
    
    const rating = calculateSurfRating(waveHeight, windSpeedKmh, waveDirection, windDirection);
    
    return {
      spotId,
      waveHeight,
      waveDirection: degreesToCompass(waveDirection),
      wavePeriod,
      windSpeed: windSpeedKmh,
      windDirection: degreesToCompass(windDirection),
      airTemperature: 20, // Open-Meteo doesn't provide air temp in marine API, use default
      waterTemperature: 18, // Default for Victoria waters
      rating,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`Failed to fetch conditions for spot ${spotId}:`, error);
    throw error;
  }
}

export async function getForecastFromAPI(spotId: number, latitude: number, longitude: number, days: number = 7): Promise<Partial<Forecast>[]> {
  try {
    const data = await fetchOpenMeteoForecast(latitude, longitude);
    
    const forecasts: Partial<Forecast>[] = [];
    
    // Group hourly data by day and take midday values (12:00)
    const hoursPerDay = 24;
    const middayHour = 12;
    
    for (let day = 0; day < Math.min(days, 7); day++) {
      const dayStartIndex = day * hoursPerDay;
      const middayIndex = dayStartIndex + middayHour;
      
      if (middayIndex < data.hourly.time.length) {
        const date = new Date(data.hourly.time[middayIndex]);
        const dateStr = date.toISOString().split('T')[0];
        
        const waveHeight = data.hourly.wave_height[middayIndex];
        const waveDirection = data.hourly.wave_direction[middayIndex];
        const windSpeed = data.hourly.wind_speed_10m[middayIndex];
        const windDirection = data.hourly.wind_direction_10m[middayIndex];
        
        // Convert wind speed from m/s to km/h
        const windSpeedKmh = windSpeed * 3.6;
        
        const rating = calculateSurfRating(waveHeight, windSpeedKmh, waveDirection, windDirection);
        
        forecasts.push({
          spotId,
          date: dateStr,
          waveHeight,
          waveDirection: degreesToCompass(waveDirection),
          windSpeed: windSpeedKmh,
          windDirection: degreesToCompass(windDirection),
          rating,
          airTemperature: 20, // Default air temp
          waterTemperature: 18, // Default water temp for Victoria
        });
      }
    }
    
    return forecasts;
  } catch (error) {
    console.error(`Failed to fetch forecast for spot ${spotId}:`, error);
    throw error;
  }
}

// Note: Open-Meteo doesn't provide tide data, so we'll keep using mock data for tides
// In a production app, you'd integrate with a dedicated tide API like NOAA or local Australian services