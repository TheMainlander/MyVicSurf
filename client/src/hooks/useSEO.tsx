import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
}

export function useSEO(seoData: SEOData) {
  const [location] = useLocation();

  useEffect(() => {
    // Update document title
    document.title = seoData.title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Update meta description
    updateMetaTag('description', seoData.description);

    // Update keywords if provided
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }

    // Update Open Graph tags
    updateMetaTag('og:title', seoData.title, true);
    updateMetaTag('og:description', seoData.description, true);
    updateMetaTag('og:url', `${window.location.origin}${location}`, true);
    updateMetaTag('og:type', seoData.ogType || 'website', true);
    updateMetaTag('og:site_name', 'VicSurf', true);

    // Update OG image
    if (seoData.ogImage) {
      updateMetaTag('og:image', `${window.location.origin}${seoData.ogImage}`, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoData.title);
    updateMetaTag('twitter:description', seoData.description);
    
    if (seoData.ogImage) {
      updateMetaTag('twitter:image', `${window.location.origin}${seoData.ogImage}`);
    }

    // Add structured data if provided
    if (seoData.structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(seoData.structuredData);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${location}`;

  }, [seoData, location]);
}

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: "Victoria Surf Report & Forecast | Real-time Conditions | VicSurf",
    description: "Get real-time Victoria surf conditions, wave forecasts, and tide charts. Track your favorite spots with VicSurf's accurate surf intelligence platform.",
    keywords: "Victoria surf forecast, Melbourne surf report, surf conditions Victoria, wave height, surf spots Australia",
    ogImage: "/og-vicsurf-home.jpg"
  },
  
  spots: {
    title: "Victoria Surf Spots & Beaches | Live Wave Conditions | VicSurf", 
    description: "Discover Victoria's best surf breaks including Bells Beach, Torquay Point, and Jan Juc. Live wave height, wind direction, and surf reports.",
    keywords: "Victoria surf spots, Bells Beach, Torquay Point, Jan Juc, surf breaks Victoria, Australian surf beaches",
    ogImage: "/og-vicsurf-spots.jpg"
  },

  forecast: {
    title: "7-Day Victoria Surf Forecast | Extended Wave Predictions | VicSurf",
    description: "Comprehensive 7-day surf forecast for Victoria beaches. Wave height, wind direction, tides, and optimal surf times for planning sessions.",
    keywords: "7 day surf forecast Victoria, extended surf forecast, wave height predictions, surf planning Victoria",
    ogImage: "/og-vicsurf-forecast.jpg"
  },

  profile: {
    title: "Surf Profile & Favorites | Track Your Sessions | VicSurf",
    description: "Manage your surf profile, track favorite spots, and view your surfing history across Victoria's best breaks.",
    keywords: "surf profile, favorite surf spots, surf tracking, session history",
    ogImage: "/og-vicsurf-profile.jpg"
  }
};

// Helper function to generate spot-specific SEO
export const generateSpotSEO = (spotName: string, spotData?: any): SEOData => {
  const title = `${spotName} Surf Forecast | Live Conditions & Waves | VicSurf`;
  const description = `Current surf conditions for ${spotName}: wave height, wind direction, tides, and 7-day forecast. Plan your surf session with real-time data.`;
  
  let structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Beach",
    "name": spotName,
    "address": {
      "@type": "PostalAddress", 
      "addressRegion": "Victoria",
      "addressCountry": "AU"
    }
  };

  // Add coordinates if available
  if (spotData) {
    structuredData.geo = {
      "@type": "GeoCoordinates",
      "latitude": spotData.latitude,
      "longitude": spotData.longitude
    };
  }

  return {
    title,
    description,
    keywords: `${spotName} surf forecast, ${spotName} surf conditions, ${spotName} waves, Victoria surf`,
    ogImage: `/og-${spotName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    structuredData
  };
};

// Helper function to generate weather structured data
export const generateWeatherSchema = (spotName: string, conditions: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "WeatherObservation",
    "name": `${spotName} Surf Conditions`,
    "observationDate": new Date().toISOString(),
    "weatherCondition": {
      "@type": "WeatherCondition",
      "windSpeed": `${conditions.windSpeed} km/h`,
      "windDirection": conditions.windDirection,
      "description": `Wave height: ${conditions.waveHeight}m`
    },
    "place": {
      "@type": "Beach",
      "name": spotName,
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Victoria", 
        "addressCountry": "AU"
      }
    }
  };
};