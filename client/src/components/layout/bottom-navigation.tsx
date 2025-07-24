import { Link, useLocation } from "wouter";

interface BottomNavigationProps {
  activeTab?: string;
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const [location] = useLocation();
  
  const getActiveClass = (path: string) => {
    if (activeTab) {
      return activeTab === path ? "text-ocean-blue" : "text-coastal-grey hover:text-ocean-blue";
    }
    return location === path || (path === "home" && location === "/") 
      ? "text-ocean-blue" 
      : "text-coastal-grey hover:text-ocean-blue";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-3">
          <Link href="/">
            <a className={`flex flex-col items-center space-y-1 transition-colors ${getActiveClass("home")}`}>
              <i className="fas fa-home text-lg"></i>
              <span className="text-xs font-medium">Home</span>
            </a>
          </Link>
          
          <Link href="/spots">
            <a className={`flex flex-col items-center space-y-1 transition-colors ${getActiveClass("spots")}`}>
              <i className="fas fa-map-marker-alt text-lg"></i>
              <span className="text-xs">Spots</span>
            </a>
          </Link>
          
          <Link href="/forecast">
            <a className={`flex flex-col items-center space-y-1 transition-colors ${getActiveClass("forecast")}`}>
              <i className="fas fa-chart-line text-lg"></i>
              <span className="text-xs">Forecast</span>
            </a>
          </Link>
          
          <Link href="/profile">
            <a className={`flex flex-col items-center space-y-1 transition-colors ${getActiveClass("profile")}`}>
              <i className="fas fa-user text-lg"></i>
              <span className="text-xs">Profile</span>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
