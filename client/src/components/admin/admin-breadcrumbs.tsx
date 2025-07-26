import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNavigation, AdminRoute } from "@/config/admin-navigation";

interface AdminBreadcrumbsProps {
  currentPath: string;
  className?: string;
}

export default function AdminBreadcrumbs({ currentPath, className = "" }: AdminBreadcrumbsProps) {
  const currentRoute = AdminNavigation.getRouteByPath(currentPath);
  
  if (!currentRoute) return null;
  
  const breadcrumbs = AdminNavigation.getBreadcrumbs(currentRoute.id);
  
  // Always show breadcrumbs to help with navigation
  // if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className={`flex items-center space-x-2 text-sm bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 ${className}`}>
      {breadcrumbs.map((route, index) => (
        <div key={route.id} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-600 mx-2" />}
          
          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className="text-gray-900 font-medium">{route.title}</span>
          ) : (
            // Clickable breadcrumb
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-1 h-auto"
              onClick={() => window.location.href = route.path}
            >
              <route.icon className="h-3 w-3 mr-1" />
              {route.title}
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
}