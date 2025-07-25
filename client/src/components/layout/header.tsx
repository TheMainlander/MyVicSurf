import { useState } from "react";
import { Button } from "@/components/ui/button";
import APIStatus from "@/components/ui/api-status";
import { useAuth } from "@/hooks/useAuth";
import FavoritesSidebar from "@/components/favorites/favorites-sidebar";
import { User, LogIn, LogOut, MapPin } from "lucide-react";

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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Top Row - Brand and Actions */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <div className="text-xl wave-animation">🏄‍♀️</div>
            <h1 className="text-lg font-bold text-ocean-blue">
              VicSurf
            </h1>
          </div>

          <div className="flex items-center space-x-1">
            {!isAuthenticated && !isLoading && (
              <Button
                onClick={handleSignIn}
                size="sm"
                className="bg-ocean-blue text-white hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium"
              >
                <LogIn className="h-3 w-3 mr-1.5" />
                Sign In
              </Button>
            )}

            {isAuthenticated && (
              <>
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  size="sm"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 px-2.5 py-1.5 rounded-md text-xs font-medium"
                >
                  ⚡ Pro
                </Button>
                <Button
                  onClick={handleSignOut}
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            <Button 
              variant="ghost" 
              size="sm"
              className="text-ocean-blue hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md"
              onClick={() => setShowFavorites(!showFavorites)}
              title="View saved beaches"
            >
              <User className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Bottom Row - Subtitle and Status */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-coastal-grey">Victoria Surf Conditions</p>
          <APIStatus className="text-xs px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-600" />
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