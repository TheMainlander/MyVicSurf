import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FavoriteButtonProps {
  spotId: number;
  userId: string;
  variant?: "default" | "icon";
  className?: string;
}

export default function FavoriteButton({ 
  spotId, 
  userId, 
  variant = "default",
  className = "" 
}: FavoriteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if spot is favorited
  const { data: favoriteStatus } = useQuery({
    queryKey: ["/api/users", userId, "favorites", spotId, "check"],
    enabled: !!userId && !!spotId,
  });

  const isFavorited = favoriteStatus?.isFavorited || false;

  // Add/remove favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        // Remove favorite
        await apiRequest("DELETE", `/api/users/${userId}/favorites/${spotId}`);
        return { action: "removed" };
      } else {
        // Add favorite
        await apiRequest("POST", `/api/users/${userId}/favorites`, { spotId });
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", userId, "favorites"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", userId, "favorites", spotId, "check"] 
      });

      toast({
        title: result.action === "added" ? "Added to Favorites" : "Removed from Favorites",
        description: result.action === "added" 
          ? "This spot has been added to your favorites" 
          : "This spot has been removed from your favorites",
      });
    },
    onError: (error) => {
      console.error("Favorite operation failed:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    favoriteMutation.mutate();
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFavoriteClick}
        disabled={favoriteMutation.isPending}
        className={`p-2 ${className}`}
      >
        <i 
          className={`${
            isFavorited ? "fas fa-heart text-red-500" : "far fa-heart text-coastal-grey"
          } ${favoriteMutation.isPending ? "animate-pulse" : ""}`}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size="sm"
      onClick={handleFavoriteClick}
      disabled={favoriteMutation.isPending}
      className={className}
    >
      <i 
        className={`${
          isFavorited ? "fas fa-heart" : "far fa-heart"
        } mr-2 ${favoriteMutation.isPending ? "animate-pulse" : ""}`}
      />
      {isFavorited ? "Favorited" : "Add to Favorites"}
    </Button>
  );
}