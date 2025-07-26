import { useState } from "react";
import { Button } from "@/components/ui/button";
import APIStatus from "@/components/ui/api-status";
import { useAuth } from "@/hooks/useAuth";
import { User, LogIn, LogOut, Menu, X, Home, MapPin, TrendingUp, Heart, Settings, BarChart3, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Header() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);



  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Top Row - Brand and Actions */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            {/* Hamburger Menu - Temporarily Hidden */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hidden text-ocean-blue hover:bg-blue-50 p-1.5 rounded-md mr-1 relative z-10"
              title={isMenuOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setLocation('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setLocation('/');
                }
              }}
              title="Go to Home"
            >
              <div className="text-xl wave-animation">🏄‍♀️</div>
              <h1 className="text-lg font-bold text-ocean-blue">
                VicSurf
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                >
                  ⚡ Upgrade
                </Button>
                <APIStatus className="whitespace-nowrap" />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-ocean-blue hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md min-w-[32px] min-h-[32px] flex items-center justify-center"
                  onClick={() => setLocation('/profile')}
                  title="Manage profile and favorites"
                >
                  <User className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={handleSignOut}
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-md min-w-[32px] min-h-[32px] flex items-center justify-center"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row - Subtitle */}
        <div className="flex items-center justify-start">
          <p className="text-xs text-coastal-grey">Victoria Surf Conditions</p>
        </div>
      </div>

      {/* Mobile Menu Overlay - Temporarily Hidden */}
      {false && isMenuOpen && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/30 backdrop-blur-sm" 
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsMenuOpen(false);
            }
          }}
        >
          <div 
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-gray-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="text-xl">🏄‍♀️</div>
                <h2 className="text-lg font-bold text-ocean-blue">VicSurf</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:bg-gray-100 p-1.5"
                aria-label="Close Menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-3 hover:bg-blue-50"
                  onClick={() => {
                    setLocation('/');
                    setIsMenuOpen(false);
                  }}
                >
                  <Home className="h-4 w-4 mr-3" />
                  Home
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-3 hover:bg-blue-50"
                  onClick={() => {
                    setLocation('/spots');
                    setIsMenuOpen(false);
                  }}
                >
                  <MapPin className="h-4 w-4 mr-3" />
                  Surf Spots
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-3 hover:bg-blue-50"
                  onClick={() => {
                    setLocation('/forecast');
                    setIsMenuOpen(false);
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Forecast
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-3 hover:bg-blue-50"
                  onClick={() => {
                    setLocation('/comparison');
                    setIsMenuOpen(false);
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-3" />
                  Compare Spots
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-3 hover:bg-blue-50"
                  onClick={() => {
                    setLocation('/feedback');
                    setIsMenuOpen(false);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Send Feedback
                </Button>
                
                {isAuthenticated && (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left p-3 hover:bg-blue-50"
                      onClick={() => {
                        setLocation('/profile');
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile & Favorites
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left p-3 hover:bg-yellow-50"
                      onClick={() => {
                        window.location.href = '/pricing';
                        setIsMenuOpen(false);
                      }}
                    >
                      <span className="mr-3">⚡</span>
                      Upgrade Plan
                    </Button>
                  </>
                )}
                
                {!isAuthenticated && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 hover:bg-blue-50"
                    onClick={() => {
                      handleSignIn();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-3" />
                    Sign In
                  </Button>
                )}
              </div>
              
              {isAuthenticated && (
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 hover:bg-red-50 text-red-600"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}