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
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-3">
            <div className="text-2xl wave-animation">🏄‍♀️</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-ocean-blue to-cyan-600 bg-clip-text text-transparent leading-tight">
                VicSurf
              </h1>
              <p className="text-xs text-coastal-grey leading-tight">Victoria Surf Conditions</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <APIStatus className="bg-green-50 border-green-200 text-green-700 text-xs px-2 py-1 rounded-full h-6 flex items-center" />
            
            {!isAuthenticated && !isLoading && (
              <Button
                onClick={handleSignIn}
                size="sm"
                className="bg-ocean-blue text-white hover:bg-blue-700 transition-all duration-300 px-3 py-1.5 rounded-lg gap-2 text-sm font-medium shadow-sm hover:shadow-md h-8 flex items-center"
              >
                <LogIn className="h-4 w-4 stroke-2" />
                Sign In
              </Button>
            )}

            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  size="sm"
                  className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1.5 rounded-lg gap-2 text-sm font-medium shadow-sm hover:shadow-md h-8 flex items-center"
                >
                  ⚡ Upgrade
                </Button>
                <Button
                  onClick={handleSignOut}
                  size="sm"
                  variant="outline"
                  className="border-gray-200 text-coastal-grey hover:bg-gray-50 hover:border-gray-300 hover:text-ocean-blue transition-all duration-300 px-3 py-1.5 rounded-lg gap-2 text-sm font-medium shadow-sm hover:shadow-md h-8 flex items-center"
                >
                  <LogOut className="h-4 w-4 stroke-2" />
                  Sign Out
                </Button>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 text-ocean-blue hover:text-blue-600 shadow-sm hover:shadow-md hover:scale-105 h-8 w-8 flex items-center justify-center"
              onClick={() => setShowFavorites(!showFavorites)}
              title="View your saved beaches"
            >
              <User className="h-4 w-4 stroke-2" />
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