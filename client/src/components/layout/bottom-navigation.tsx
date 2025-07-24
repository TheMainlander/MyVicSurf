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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200/50 z-50 shadow-lg">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-3">
          <Link href="/" className={`flex flex-col items-center space-y-1 transition-all duration-200 py-2 px-3 rounded-xl ${
            getActiveClass("home").includes("ocean-blue") 
              ? "text-blue-600 bg-blue-50 scale-110 shadow-sm" 
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-105"
          }`}>
            <div className="text-lg">🏠</div>
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          <Link href="/spots" className={`flex flex-col items-center space-y-1 transition-all duration-200 py-2 px-3 rounded-xl ${
            getActiveClass("spots").includes("ocean-blue") 
              ? "text-blue-600 bg-blue-50 scale-110 shadow-sm" 
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-105"
          }`}>
            <div className="text-lg">📍</div>
            <span className="text-xs font-medium">Spots</span>
          </Link>
          
          <Link href="/forecast" className={`flex flex-col items-center space-y-1 transition-all duration-200 py-2 px-3 rounded-xl ${
            getActiveClass("forecast").includes("ocean-blue") 
              ? "text-blue-600 bg-blue-50 scale-110 shadow-sm" 
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-105"
          }`}>
            <div className="text-lg">📈</div>
            <span className="text-xs font-medium">Forecast</span>
          </Link>
          
          <Link href="/favorites" className={`flex flex-col items-center space-y-1 transition-all duration-200 py-2 px-3 rounded-xl ${
            getActiveClass("favorites").includes("ocean-blue") 
              ? "text-red-500 bg-red-50 scale-110 shadow-sm" 
              : "text-gray-500 hover:text-red-500 hover:bg-red-50/50 hover:scale-105"
          }`}>
            <div className="text-lg">❤️</div>
            <span className="text-xs font-medium">Favorites</span>
          </Link>
          
          <Link href="/profile" className={`flex flex-col items-center space-y-1 transition-all duration-200 py-2 px-3 rounded-xl ${
            getActiveClass("profile").includes("ocean-blue") 
              ? "text-blue-600 bg-blue-50 scale-110 shadow-sm" 
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 hover:scale-105"
          }`}>
            <div className="text-lg">👤</div>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
