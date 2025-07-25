import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserFavorite, SurfSpot, SurfCondition } from "@shared/schema";

interface FavoritesSidebarProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FavoriteWithConditions extends UserFavorite {
  spot: SurfSpot & { conditions?: SurfCondition };
}

export default function FavoritesSidebar({ userId, isOpen, onClose }: FavoritesSidebarProps) {
  const { data: favorites, isLoading } = useQuery<FavoriteWithConditions[]>({
    queryKey: ["/api/users", userId, "favorites"],
    enabled: !!userId && isOpen,
  });

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('favorites-sidebar');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" />
      
      {/* Sidebar */}
      <div 
        id="favorites-sidebar"
        className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-ocean-blue to-blue-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <i className="fas fa-heart text-coral"></i>
              Favorite Beaches
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            Quick access to your saved spots
          </p>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg mb-3"></div>
                </div>
              ))}
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="space-y-3">
              {favorites.map((favorite) => (
                <Card key={favorite.id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <CardContent className="p-3">
                    <Link href={`/?spot=${favorite.spot.id}`} onClick={onClose}>
                      <div className="flex items-start gap-3">
                        <img 
                          src={favorite.spot.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=60"} 
                          alt={favorite.spot.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-medium text-sm text-gray-800 truncate">
                              {favorite.spot.name}
                            </h3>
                            {favorite.spot.conditions && (
                              <Badge 
                                className={`${getRatingColor(favorite.spot.conditions.rating)} text-white text-xs ml-2 flex-shrink-0`}
                                style={{ fontSize: '10px' }}
                              >
                                {getRatingText(favorite.spot.conditions.rating)}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-2">
                            {favorite.spot.region}
                          </p>
                          
                          {favorite.spot.conditions && (
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center">
                                <i className="fas fa-water text-ocean-blue mr-1"></i>
                                {favorite.spot.conditions.waveHeight}m
                              </span>
                              <span className="flex items-center">
                                <i className="fas fa-wind mr-1"></i>
                                {favorite.spot.conditions.windSpeed}km/h
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              {favorite.spot.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              Added {favorite.addedAt ? new Date(favorite.addedAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <Link href="/favorites" onClick={onClose}>
                  <Button variant="outline" className="w-full text-sm">
                    <i className="fas fa-list mr-2"></i>
                    Manage All Favorites
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <i className="far fa-heart text-4xl text-gray-300"></i>
              </div>
              <h3 className="font-medium text-gray-600 mb-2">No favorites yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Add beaches to your favorites for quick access
              </p>
              <Link href="/spots" onClick={onClose}>
                <Button size="sm">
                  <i className="fas fa-plus mr-2"></i>
                  Browse Beaches
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}