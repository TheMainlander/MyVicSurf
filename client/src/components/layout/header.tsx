import { useState } from "react";
import { Button } from "@/components/ui/button";
import APIStatus from "@/components/ui/api-status";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    console.log('Open settings');
  };

  const handleSignIn = () => {
    window.location.href = "/api/login";
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
                className="bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all duration-200 px-4 py-2 rounded-lg shadow-md"
              >
                Sign In
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110 text-gray-500 hover:text-blue-600"
              onClick={handleSettingsClick}
            >
              <div className="text-lg">⚙️</div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
