import { Link, useLocation } from "wouter";
import { Home, MapPin, TrendingUp, User, BarChart3 } from "lucide-react";

interface BottomNavigationProps {
  activeTab?: string;
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (activeTab) {
      return activeTab === path;
    }
    return location === path || (path === "home" && location === "/");
  };

  const navItems = [
    { path: "home", href: "/", icon: Home, label: "Home" },
    { path: "spots", href: "/spots", icon: MapPin, label: "Spots" },
    { path: "comparison", href: "/comparison", icon: BarChart3, label: "Compare" },
    { path: "forecast", href: "/forecast", icon: TrendingUp, label: "Forecast" },
    { path: "profile", href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 z-50 shadow-2xl">
      <div className="max-w-md mx-auto px-2">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const IconComponent = item.icon;
            const isFavorites = item.path === "favorites";
            
            return (
              <Link 
                key={item.path}
                href={item.href} 
                className={`group relative flex flex-col items-center justify-center min-w-[64px] min-h-[64px] py-2 px-2 rounded-2xl transition-all duration-300 ease-out transform active:scale-95 touch-manipulation ${
                  active
                    ? isFavorites
                      ? "text-red-500 bg-red-50 scale-105 shadow-lg shadow-red-500/20" 
                      : "text-ocean-blue bg-ocean-blue/10 scale-105 shadow-lg shadow-ocean-blue/20"
                    : "text-coastal-grey hover:text-ocean-blue hover:bg-ocean-blue/5 hover:scale-105"
                }`}
              >
                {/* Active indicator dot */}
                {active && (
                  <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-300 ${
                    isFavorites ? "bg-red-500" : "bg-ocean-blue"
                  }`} />
                )}
                
                {/* Icon container with scale animation */}
                <div className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <IconComponent 
                    size={active ? 24 : 22} 
                    className={`transition-all duration-300 ${
                      active 
                        ? isFavorites
                          ? "stroke-2 text-red-500" 
                          : "stroke-2 text-ocean-blue"
                        : "stroke-1.5 text-coastal-grey group-hover:text-ocean-blue"
                    }`}
                  />
                </div>
                
                {/* Label with dynamic styling */}
                <span className={`text-xs font-medium mt-1.5 transition-all duration-300 ${
                  active 
                    ? isFavorites
                      ? "text-red-500 font-semibold" 
                      : "text-ocean-blue font-semibold"
                    : "text-coastal-grey group-hover:text-ocean-blue"
                }`}>
                  {item.label}
                </span>
                
                {/* Ripple effect on tap */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-20 group-active:bg-current transition-opacity duration-150" />
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white/95" />
    </nav>
  );
}
