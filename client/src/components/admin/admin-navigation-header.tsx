import { Button } from "@/components/ui/button";
import { AdminNavigation } from "@/config/admin-navigation";
import AdminBreadcrumbs from "./admin-breadcrumbs";

interface AdminNavigationHeaderProps {
  currentPath: string;
  title: string;
  description: string;
  additionalActions?: React.ReactNode;
  className?: string;
}

export default function AdminNavigationHeader({ 
  currentPath, 
  title, 
  description, 
  additionalActions,
  className = "" 
}: AdminNavigationHeaderProps) {
  const backNav = AdminNavigation.getBackNavigation(currentPath);
  
  return (
    <div className={`mb-6 ${className}`}>
      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {backNav && (
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = backNav.path}
            >
              <backNav.icon className="h-4 w-4 mr-2" />
              {backNav.title}
            </Button>
          )}
          
          {/* Additional Action Buttons */}
          {additionalActions}
        </div>
        
        {/* Breadcrumbs */}
        <AdminBreadcrumbs currentPath={currentPath} />
      </div>
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white/80">{description}</p>
      </div>
    </div>
  );
}