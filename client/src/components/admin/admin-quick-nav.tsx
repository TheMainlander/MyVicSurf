import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminNavigation } from "@/config/admin-navigation";
import { ExternalLink } from "lucide-react";

interface AdminQuickNavProps {
  currentPath: string;
  userRole: string;
  className?: string;
}

export default function AdminQuickNav({ currentPath, userRole, className = "" }: AdminQuickNavProps) {
  const navigationItems = AdminNavigation.getNavigationItems(userRole, currentPath);
  const currentRoute = AdminNavigation.getRouteByPath(currentPath);
  
  // Get sibling routes (same parent) for quick navigation
  const siblingRoutes = currentRoute?.parentId 
    ? AdminNavigation.getChildren(currentRoute.parentId).filter(route => 
        route.id !== currentRoute.id && 
        route.showInNavigation &&
        AdminNavigation.hasAccess(route, userRole)
      )
    : [];
  
  // Get child routes for current page
  const childRoutes = currentRoute 
    ? AdminNavigation.getChildren(currentRoute.id).filter(route => 
        route.showInNavigation &&
        AdminNavigation.hasAccess(route, userRole)
      )
    : [];
  
  const quickNavRoutes = [...siblingRoutes, ...childRoutes];
  
  if (quickNavRoutes.length === 0) return null;
  
  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h3>
        <div className="flex flex-wrap gap-2">
          {quickNavRoutes.map((route) => (
            <Button
              key={route.id}
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={() => window.location.href = route.path}
            >
              <route.icon className="h-3 w-3 mr-2" />
              {route.title}
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}