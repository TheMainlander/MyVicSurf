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
      {/* Breadcrumbs - Prominent Position */}
      <div className="mb-4">
        <AdminBreadcrumbs currentPath={currentPath} />
      </div>
      
      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {backNav && (
            <Button
              variant="outline"
              className="border-gray-600 text-gray-800 hover:bg-gray-200"
              onClick={() => window.location.href = backNav.path}
            >
              <backNav.icon className="h-4 w-4 mr-2" />
              {backNav.title}
            </Button>
          )}
          
          {/* Additional Action Buttons */}
          {additionalActions}
        </div>
      </div>
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
}