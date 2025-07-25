import { useState } from "react";
import { Button } from "@/components/ui/button";
import APIStatus from "@/components/ui/api-status";
import { useAuth } from "@/hooks/useAuth";
import FavoritesSidebar from "@/components/favorites/favorites-sidebar";
import { Heart, User, LogIn, LogOut } from "lucide-react";

export default function Header() {
  const [showFavorites, setShowFavorites] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";



  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl wave-animation">🏄‍♀️</div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                VicSurf
              </h1>
              <p className="text-xs text-gray-600">Victoria Surf Conditions</p>
            </div>
            <APIStatus className="bg-green-50 border-green-200 text-green-700" />
          </div>

          <div className="flex items-center space-x-2">
            {!isAuthenticated && !isLoading && (
              <Button
                onClick={handleSignIn}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all duration-200 px-4 py-2 rounded-lg shadow-md gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}

            {isAuthenticated && (
              <Button
                onClick={handleSignOut}
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-105 transition-all duration-200 px-4 py-2 rounded-lg shadow-md gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110 text-gray-500 hover:text-red-500"
              onClick={() => setShowFavorites(!showFavorites)}
              title="Quick access to favorite beaches"
            >
              <Heart className="h-5 w-5 fill-current" />
            </Button>
          </div>
        </div>
      </div>

      {/* Favorites Sidebar */}
      <FavoritesSidebar 
        userId={currentUserId}
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
      />
    </header>
  );
}