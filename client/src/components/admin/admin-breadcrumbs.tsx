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
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {breadcrumbs.map((route, index) => (
        <div key={route.id} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-white/60 mx-2" />}
          
          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className="text-white/80 font-medium">{route.title}</span>
          ) : (
            // Clickable breadcrumb
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-auto"
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