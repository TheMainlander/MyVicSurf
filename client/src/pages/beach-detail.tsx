import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingOverlay from "@/components/common/loading-overlay";
import FavoriteButton from "@/components/favorites/favorite-button";
import QuickShare from "@/components/social/quick-share";
import ForecastTimeline from "@/components/surf/forecast-timeline";
import TideInformation from "@/components/surf/tide-information";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Waves, Wind, Thermometer, Eye, Camera, Navigation, AlertTriangle, Info } from "lucide-react";
import type { SurfSpot, SurfCondition } from "@shared/schema";

interface SpotWithConditions extends SurfSpot {
  conditions?: SurfCondition;
}

export default function BeachDetail() {
  const { id } = useParams();
  const spotId = parseInt(id || "1");
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";

  const { data: spot, isLoading: spotLoading } = useQuery<SpotWithConditions>({
    queryKey: ["/api/surf-spots", spotId],
  });

  const { data: conditions, isLoading: conditionsLoading } = useQuery<SurfCondition>({
    queryKey: ["/api/surf-spots", spotId, "conditions"],
  });

  if (spotLoading || conditionsLoading) {
    return <LoadingOverlay message="Loading beach details..." />;
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-lg font-semibold mb-2">Beach not found</h2>
              <p className="text-gray-600 mb-4">The requested beach could not be found.</p>
              <Button onClick={() => window.location.href = "/spots"}>
                Back to Beaches
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation activeTab="spots" />
      </div>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent": return "bg-green-500";
      case "very-good": return "bg-green-400";
      case "good": return "bg-wave-green";
      case "fair": return "bg-warning-orange";
      case "poor": return "bg-alert-red";
      default: return "bg-coastal-grey";
    }
  };

  const getRatingText = (rating: string) => {
    switch (rating) {
      case "very-good": return "Very Good";
      default: return rating.charAt(0).toUpperCase() + rating.slice(1);
    }
  };

  const getBeachTypeColor = (beachType: string) => {
    switch (beachType) {
      case "surf": return "bg-ocean-blue text-white";
      case "swimming": return "bg-wave-green text-white";
      case "both": return "bg-coastal-grey text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-orange-500";
      case "expert": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        {/* Hero Section */}
        <section className="py-4">
          <div className="relative rounded-lg overflow-hidden mb-4">
            <img 
              src={spot.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300"} 
              alt={spot.name}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{spot.name}</h1>
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {spot.region}
                  </div>
                </div>
                <div className="flex gap-2">
                  <FavoriteButton 
                    spotId={spot.id} 
                    userId={currentUserId}
                    variant="icon"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Beach Type & Category */}
          <div className="flex gap-2 mb-4">
            <Badge className={getBeachTypeColor(spot.beachType)}>
              {spot.beachType === "both" ? "Surf & Swimming" : spot.beachType}
            </Badge>
            {spot.beachCategory && (
              <Badge variant="outline">
                {spot.beachCategory.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
            <Badge className={`${getDifficultyColor(spot.difficulty)} text-white`}>
              {spot.difficulty}
            </Badge>
          </div>
        </section>

        {/* Current Conditions */}
        {(conditions || spot.conditions) && (
          <section className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Waves className="w-5 h-5 mr-2 text-ocean-blue" />
                  Current Conditions
                  {(conditions?.rating || spot.conditions?.rating) && (
                    <Badge className={`ml-auto ${getRatingColor(conditions?.rating || spot.conditions?.rating || "")} text-white`}>
                      {getRatingText(conditions?.rating || spot.conditions?.rating || "")}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Waves className="w-6 h-6 text-ocean-blue mx-auto mb-2" />
                    <div className="text-lg font-semibold">{(conditions?.waveHeight || spot.conditions?.waveHeight || 0).toFixed(1)}m</div>
                    <div className="text-xs text-gray-600">{conditions?.waveDirection || spot.conditions?.waveDirection}</div>
                  </div>
                  <div className="text-center">
                    <Wind className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">{Math.round(conditions?.windSpeed || spot.conditions?.windSpeed || 0)} km/h</div>
                    <div className="text-xs text-gray-600">{conditions?.windDirection || spot.conditions?.windDirection}</div>
                  </div>
                  <div className="text-center">
                    <Thermometer className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold">{Math.round(conditions?.airTemperature || spot.conditions?.airTemperature || 20)}°C</div>
                    <div className="text-xs text-gray-600">Air Temp</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Beach Description */}
        {spot.description && (
          <section className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  About This Beach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{spot.description}</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Facilities */}
        {spot.facilities && spot.facilities.length > 0 && (
          <section className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Facilities & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {spot.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      {facility}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Access & Best Conditions */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {spot.accessInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Navigation className="w-5 h-5 mr-2 text-green-600" />
                  Access Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">{spot.accessInfo}</p>
              </CardContent>
            </Card>
          )}

          {spot.bestConditions && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Eye className="w-5 h-5 mr-2 text-purple-600" />
                  Best Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">{spot.bestConditions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Hazards */}
        {spot.hazards && spot.hazards.length > 0 && (
          <section className="mb-6">
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-orange-700">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Safety & Hazards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {spot.hazards.map((hazard, index) => (
                    <div key={index} className="flex items-center text-sm text-orange-700">
                      <AlertTriangle className="w-3 h-3 mr-2" />
                      {hazard}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Forecast Timeline */}
        <ForecastTimeline spotId={spotId} />

        {/* Tide Information */}
        <TideInformation spotId={spotId} />

        {/* Action Buttons */}
        <section className="pt-6">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="bg-ocean-blue hover:bg-ocean-blue/90"
              onClick={() => window.location.href = `/forecast?spot=${spotId}`}
            >
              <Waves className="w-4 h-4 mr-2" />
              Extended Forecast
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/spots/${spotId}/cameras`}
            >
              <Camera className="w-4 h-4 mr-2" />
              Beach Cams
            </Button>
          </div>
          
          <div className="mt-3">
            <QuickShare spot={spot} conditions={conditions || spot.conditions} />
          </div>
        </section>
      </main>

      <BottomNavigation activeTab="spots" />
    </div>
  );
}