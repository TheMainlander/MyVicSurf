/**
 * Professional Surf Metrics Calculation Engine
 * 
 * This module provides calculation functions for enhanced surf forecasting metrics
 * to compete with professional platforms like Surfline.
 */

export interface EnhancedWaveMetrics {
  heightMeters: number;
  heightFeet: number;
  swellHeight: number;
  breakingHeight: number;
  waveEnergy: number;
  confidence: number;
}

export interface SwellClassification {
  type: 'ground_swell' | 'wind_swell' | 'mixed';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
}

export interface SurfScore {
  overallScore: number; // 1.0-10.0
  waveQuality: number;
  windQuality: number;
  tideOptimal: number;
  consistencyScore: number;
}

/**
 * Convert wave height between meters and feet
 */
export const convertWaveHeight = (heightMeters: number): EnhancedWaveMetrics => {
  const heightFeet = heightMeters * 3.28084;
  
  // Estimate swell height (typically 10-20% larger than breaking height)
  const swellHeight = heightMeters * 1.15;
  
  // Breaking height is usually smaller than swell height due to energy loss
  const breakingHeight = heightMeters * 0.9;
  
  return {
    heightMeters,
    heightFeet: Math.round(heightFeet * 10) / 10,
    swellHeight: Math.round(swellHeight * 10) / 10,
    breakingHeight: Math.round(breakingHeight * 10) / 10,
    waveEnergy: 0, // Will be calculated separately
    confidence: 85 // Default confidence level
  };
};

/**
 * Calculate wave energy using the formula: Energy = Height² × Period
 */
export const calculateWaveEnergy = (height: number, period: number): number => {
  return Math.round(Math.pow(height, 2) * period);
};

/**
 * Classify swell quality based on wave period
 */
export const classifySwellQuality = (period: number): SwellClassification => {
  if (period >= 13) {
    return {
      type: 'ground_swell',
      quality: 'excellent',
      description: 'Long-period groundswell - premium surf conditions'
    };
  } else if (period >= 10) {
    return {
      type: 'ground_swell',
      quality: 'good',
      description: 'Medium-period groundswell - quality waves'
    };
  } else if (period >= 8) {
    return {
      type: 'mixed',
      quality: 'fair',
      description: 'Mixed swell - average conditions'
    };
  } else {
    return {
      type: 'wind_swell',
      quality: 'poor',
      description: 'Wind swell - choppy conditions'
    };
  }
};

/**
 * Interpret wave energy level for surfer guidance
 */
export const interpretEnergyLevel = (energy: number): string => {
  if (energy > 500) return 'Massive - Expert only';
  if (energy > 300) return 'Powerful - Advanced surfers';
  if (energy > 150) return 'Solid - Intermediate+';
  if (energy > 50) return 'Moderate - All levels';
  return 'Small - Beginners welcome';
};

/**
 * Calculate wave quality score (1-10) based on height and period
 */
export const calculateWaveScore = (height: number, period: number): number => {
  const energy = calculateWaveEnergy(height, period);
  const swellClassification = classifySwellQuality(period);
  
  let score = 1.0;
  
  // Base score from wave energy
  if (energy > 400) score += 4.0;
  else if (energy > 200) score += 3.0;
  else if (energy > 100) score += 2.5;
  else if (energy > 50) score += 2.0;
  else if (energy > 20) score += 1.5;
  else score += 1.0;
  
  // Bonus for swell quality
  switch (swellClassification.quality) {
    case 'excellent': score += 3.0; break;
    case 'good': score += 2.0; break;
    case 'fair': score += 1.0; break;
    case 'poor': score += 0.0; break;
  }
  
  // Cap at 10.0
  return Math.min(Math.round(score * 10) / 10, 10.0);
};

/**
 * Calculate wind quality score based on wind speed and direction relative to shore
 */
export const calculateWindScore = (windSpeed: number, windDirection: string, shoreDirection: string = 'S'): number => {
  let score = 5.0; // Start with neutral
  
  // Wind speed penalty/bonus
  if (windSpeed <= 5) score += 3.0; // Very light wind (glassy)
  else if (windSpeed <= 10) score += 2.0; // Light wind (clean)
  else if (windSpeed <= 15) score += 1.0; // Moderate wind (acceptable)
  else if (windSpeed <= 20) score += 0.0; // Strong wind (choppy)
  else if (windSpeed <= 30) score -= 2.0; // Very strong wind (poor)
  else score -= 4.0; // Blown out
  
  // Wind direction effect (simplified - in real implementation would use spot-specific data)
  const offshoreDirections = ['N', 'NE', 'NW'];
  const onshoreDirections = ['S', 'SE', 'SW'];
  
  if (offshoreDirections.includes(windDirection)) {
    score += 2.0; // Offshore wind cleans up waves
  } else if (onshoreDirections.includes(windDirection)) {
    score -= 1.0; // Onshore wind makes waves choppy
  }
  
  return Math.max(Math.min(Math.round(score * 10) / 10, 10.0), 1.0);
};

/**
 * Calculate tide optimization score (placeholder - would need spot-specific data)
 */
export const calculateTideScore = (currentTideHeight: number, spotOptimalTide: string = 'mid'): number => {
  // This is a simplified calculation - real implementation would use:
  // - Spot-specific optimal tide ranges
  // - Current tide direction (rising/falling)
  // - Time to optimal tide
  
  let score = 5.0;
  
  // Simple heuristic based on tide height (0-4m range)
  if (spotOptimalTide === 'low' && currentTideHeight < 1.5) score += 3.0;
  else if (spotOptimalTide === 'mid' && currentTideHeight >= 1.5 && currentTideHeight <= 2.5) score += 3.0;
  else if (spotOptimalTide === 'high' && currentTideHeight > 2.5) score += 3.0;
  else score += 1.0;
  
  return Math.max(Math.min(Math.round(score * 10) / 10, 10.0), 1.0);
};

/**
 * Calculate overall surf score combining all factors
 */
export const calculateSurfScore = (
  waveHeight: number,
  wavePeriod: number,
  windSpeed: number,
  windDirection: string,
  tideHeight: number = 2.0
): SurfScore => {
  const waveQuality = calculateWaveScore(waveHeight, wavePeriod);
  const windQuality = calculateWindScore(windSpeed, windDirection);
  const tideOptimal = calculateTideScore(tideHeight);
  
  // Weighted combination: 40% waves, 30% wind, 20% tide, 10% consistency
  const consistencyScore = 7.0; // Placeholder - would be calculated from forecast variance
  
  const overallScore = (
    waveQuality * 0.4 +
    windQuality * 0.3 +
    tideOptimal * 0.2 +
    consistencyScore * 0.1
  );
  
  return {
    overallScore: Math.round(overallScore * 10) / 10,
    waveQuality,
    windQuality,
    tideOptimal,
    consistencyScore
  };
};

/**
 * Analyze multi-swell interactions
 */
export const analyzeSwellInteraction = (
  primaryHeight: number,
  primaryPeriod: number,
  primaryDirection: string,
  secondaryHeight?: number,
  secondaryPeriod?: number,
  secondaryDirection?: string
): string => {
  if (!secondaryHeight || !secondaryPeriod || !secondaryDirection) {
    return 'single_swell';
  }
  
  // Simple interaction analysis
  const primaryEnergy = calculateWaveEnergy(primaryHeight, primaryPeriod);
  const secondaryEnergy = calculateWaveEnergy(secondaryHeight, secondaryPeriod);
  
  // If secondary is less than 30% of primary energy, it has minimal effect
  if (secondaryEnergy < primaryEnergy * 0.3) {
    return 'neutral';
  }
  
  // If swells are from similar directions (within 45°), they add constructively
  // If from opposite directions (within 135-225°), they interfere destructively
  // This is a simplified model - real oceanography is more complex
  
  const directionDifference = Math.abs(
    getDirectionDegrees(primaryDirection) - getDirectionDegrees(secondaryDirection)
  );
  
  if (directionDifference <= 45 || directionDifference >= 315) {
    return 'constructive';
  } else if (directionDifference >= 135 && directionDifference <= 225) {
    return 'destructive';
  } else {
    return 'neutral';
  }
};

/**
 * Convert compass direction to degrees
 */
const getDirectionDegrees = (direction: string): number => {
  const directions: Record<string, number> = {
    'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
    'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
    'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
    'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
  };
  return directions[direction] || 0;
};

/**
 * Calculate swell dominance percentage
 */
export const calculateSwellDominance = (
  primaryHeight: number,
  primaryPeriod: number,
  secondaryHeight?: number,
  secondaryPeriod?: number
): { primary: number; secondary: number } => {
  if (!secondaryHeight || !secondaryPeriod) {
    return { primary: 100, secondary: 0 };
  }
  
  const primaryEnergy = calculateWaveEnergy(primaryHeight, primaryPeriod);
  const secondaryEnergy = calculateWaveEnergy(secondaryHeight, secondaryPeriod);
  const totalEnergy = primaryEnergy + secondaryEnergy;
  
  return {
    primary: Math.round((primaryEnergy / totalEnergy) * 100),
    secondary: Math.round((secondaryEnergy / totalEnergy) * 100)
  };
};