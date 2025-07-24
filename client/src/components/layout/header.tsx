import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    // TODO: Implement settings modal
    console.log('Open settings');
  };

  return (
    <header className="bg-gradient-to-r from-ocean-blue to-ocean-light text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <i className="fas fa-water text-2xl"></i>
            <h1 className="text-xl font-semibold">VicSurf</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white hover:text-white"
            onClick={handleSettingsClick}
          >
            <i className="fas fa-cog text-lg"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
