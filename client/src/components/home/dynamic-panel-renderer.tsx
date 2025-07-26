import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CurrentConditions from "@/components/surf/current-conditions";
import TideInformation from "@/components/surf/tide-information";
import ForecastTimeline from "@/components/surf/forecast-timeline";
import SurfSpotsList from "@/components/surf/surf-spots-list";
import BeachCameras from "@/components/surf/beach-cameras";
import PremiumFeaturesPanel from "@/components/premium/premium-features-panel";
import SimpleFeedbackForm from "@/components/feedback/simple-feedback-form";
import WeatherAlerts from "@/components/home/weather-alerts";
import { Card, CardContent } from "@/components/ui/card";
import type { HomePanel, SurfSpot } from "@shared/schema";

interface User {
  id: string;
  role?: string;
}

interface DynamicPanelRendererProps {
  selectedSpotId: number;
  selectedSpot?: SurfSpot;
  currentUser?: User;
  userLocation?: { lat: number; lng: number } | null;
}

const componentMap = {
  CurrentConditions,
  TideInformation,
  ForecastTimeline,
  SurfSpotsList,
  BeachCameras,
  PremiumFeaturesPanel,
  SimpleFeedbackForm,
  WeatherAlerts
};

export default function DynamicPanelRenderer({ 
  selectedSpotId, 
  selectedSpot, 
  currentUser,
  userLocation 
}: DynamicPanelRendererProps) {
  const { data: panels = [], isLoading } = useQuery<HomePanel[]>({
    queryKey: ["/api/admin/home-panels"],
  });

  // Filter enabled panels and sort by order
  const enabledPanels = panels
    .filter(panel => panel.isEnabled)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Check if user has access to panel based on role
  const hasAccess = (panel: HomePanel): boolean => {
    if (!panel.requiredRole || panel.requiredRole === 'public') return true;
    if (!currentUser) return false;
    
    switch (panel.requiredRole) {
      case 'user':
        return !!currentUser;
      case 'admin':
        return currentUser.role === 'admin' || currentUser.role === 'super_admin';
      case 'super_admin':
        return currentUser.role === 'super_admin';
      default:
        return true;
    }
  };

  const renderPanel = (panel: HomePanel) => {
    const Component = componentMap[panel.componentName as keyof typeof componentMap];
    
    if (!Component) {
      console.warn(`Component ${panel.componentName} not found`);
      return null;
    }

    // Pass appropriate props based on component type
    const commonProps = {
      spotId: selectedSpotId,
      selectedSpotId,
      selectedSpot,
      userLocation
    };

    return (
      <Card key={panel.id} className="bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <Component {...commonProps} />
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enabledPanels
        .filter(hasAccess)
        .map(renderPanel)
        .filter(Boolean)}
    </div>
  );
}