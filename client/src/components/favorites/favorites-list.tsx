import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "./favorite-button";
import type { UserFavorite, SurfSpot } from "@shared/schema";

interface FavoritesListProps {
  userId: string;
  showHeader?: boolean;
  maxItems?: number;
}

export default function FavoritesList({ 
  userId, 
  showHeader = true,
  maxItems 
}: FavoritesListProps) {
  const { data: favorites, isLoading } = useQuery<(UserFavorite & { spot: SurfSpot })[]>({
    queryKey: ["/api/users", userId, "favorites"],
    enabled: !!userId,
  });

  const displayFavorites = maxItems ? favorites?.slice(0, maxItems) : favorites;

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <i className="fas fa-heart text-coral mr-2"></i>
              Your Favorites
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!displayFavorites || displayFavorites.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <i className="fas fa-heart text-coral mr-2"></i>
              Your Favorites
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-6">
            <i className="far fa-heart text-4xl text-coastal-grey mb-3"></i>
            <p className="text-coastal-grey mb-4">No favorite spots yet</p>
            <p className="text-sm text-coastal-grey">
              Start exploring spots and add them to your favorites
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent": return "bg-green-500";
      case "very-good": return "bg-green-400";
      case "good": return "bg-wave-green";
      case "fair": return "bg-warning-orange";
      case "poor": return "bg-alert-red";
      default: return "bg-gray-400";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      case "expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <i className="fas fa-heart text-coral mr-2"></i>
            Your Favorites
            <Badge variant="secondary" className="ml-auto">
              {favorites?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6 text-left pt-[14px] pb-[14px]">
        <div className="space-y-4">
          {displayFavorites.map((favorite) => (
            <div 
              key={favorite.id} 
              className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link 
                    href={`/spot/${favorite.spot.id}`}
                    className="text-decoration-none"
                  >
                    <h3 className="font-semibold text-ocean-blue hover:underline">
                      {favorite.spot.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-coastal-grey mb-2">
                    {favorite.spot.region} • {favorite.spot.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={getDifficultyColor(favorite.spot.difficulty)}
                    >
                      {favorite.spot.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-coastal-grey">
                    Added {favorite.addedAt ? new Date(favorite.addedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FavoriteButton 
                    spotId={favorite.spot.id} 
                    userId={userId}
                    variant="icon"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {maxItems && favorites && favorites.length > maxItems && (
            <div className="text-center pt-3 border-t">
              <Link href="/favorites">
                <button className="text-sm text-ocean-blue hover:underline">
                  View all {favorites.length} favorites →
                </button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}