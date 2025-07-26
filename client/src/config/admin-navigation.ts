import { 
  Settings, 
  Users, 
  HelpCircle, 
  Image as ImageIcon, 
  Home,
  ArrowLeft,
  Shield,
  LucideIcon
} from "lucide-react";

export interface AdminRoute {
  id: string;
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  parentId?: string;
  requiresRole?: 'admin' | 'super_admin';
  showInNavigation?: boolean;
}

export interface NavigationItem {
  route: AdminRoute;
  children: NavigationItem[];
  breadcrumb: AdminRoute[];
}

// Centralized admin route configuration
export const ADMIN_ROUTES: AdminRoute[] = [
  // Main app
  {
    id: 'main-app',
    path: '/',
    title: 'VicSurf App',
    description: 'Return to main application',
    icon: Home,
    showInNavigation: true
  },
  
  // Admin root
  {
    id: 'admin-root',
    path: '/admin',
    title: 'Admin Panel',
    description: 'Main admin dashboard for carousel management',
    icon: Settings,
    requiresRole: 'admin',
    showInNavigation: true
  },
  
  // User management
  {
    id: 'admin-users',
    path: '/admin/users',
    title: 'User Management',
    description: 'Manage user accounts and roles',
    icon: Users,
    parentId: 'admin-root',
    requiresRole: 'admin',
    showInNavigation: true
  },
  
  // Admin help
  {
    id: 'admin-help',
    path: '/admin/help',
    title: 'Admin Help & Documentation',
    description: 'Comprehensive guide for VicSurf administration',
    icon: HelpCircle,
    parentId: 'admin-root',
    requiresRole: 'admin',
    showInNavigation: true
  }
];

// Helper functions for navigation
export class AdminNavigation {
  private static routes = new Map(ADMIN_ROUTES.map(route => [route.id, route]));
  
  // Get route by ID
  static getRoute(id: string): AdminRoute | undefined {
    return this.routes.get(id);
  }
  
  // Get route by path
  static getRouteByPath(path: string): AdminRoute | undefined {
    return ADMIN_ROUTES.find(route => route.path === path);
  }
  
  // Build breadcrumb trail for a route
  static getBreadcrumbs(routeId: string): AdminRoute[] {
    const breadcrumbs: AdminRoute[] = [];
    let currentRoute = this.getRoute(routeId);
    
    while (currentRoute) {
      breadcrumbs.unshift(currentRoute);
      currentRoute = currentRoute.parentId ? this.getRoute(currentRoute.parentId) : undefined;
    }
    
    return breadcrumbs;
  }
  
  // Get children of a route
  static getChildren(parentId: string): AdminRoute[] {
    return ADMIN_ROUTES.filter(route => route.parentId === parentId);
  }
  
  // Get navigation items for current user role
  static getNavigationItems(userRole: string, currentPath: string): NavigationItem[] {
    const rootRoutes = ADMIN_ROUTES.filter(route => 
      !route.parentId && 
      route.showInNavigation &&
      this.hasAccess(route, userRole)
    );
    
    return rootRoutes.map(route => ({
      route,
      children: this.buildNavigationTree(route.id, userRole),
      breadcrumb: this.getBreadcrumbs(route.id)
    }));
  }
  
  // Build navigation tree recursively
  private static buildNavigationTree(parentId: string, userRole: string): NavigationItem[] {
    const children = this.getChildren(parentId).filter(route => 
      route.showInNavigation && this.hasAccess(route, userRole)
    );
    
    return children.map(route => ({
      route,
      children: this.buildNavigationTree(route.id, userRole),
      breadcrumb: this.getBreadcrumbs(route.id)
    }));
  }
  
  // Check if user has access to route
  static hasAccess(route: AdminRoute, userRole: string): boolean {
    if (!route.requiresRole) return true;
    
    const roleHierarchy = ['user', 'admin', 'super_admin'];
    const userRoleLevel = roleHierarchy.indexOf(userRole);
    const requiredRoleLevel = roleHierarchy.indexOf(route.requiresRole);
    
    return userRoleLevel >= requiredRoleLevel;
  }
  
  // Get back navigation for current route
  static getBackNavigation(currentPath: string): { path: string; title: string; icon: LucideIcon } | null {
    const currentRoute = this.getRouteByPath(currentPath);
    if (!currentRoute || !currentRoute.parentId) {
      // If no parent, go to main app
      return {
        path: '/',
        title: 'Back to App',
        icon: ArrowLeft
      };
    }
    
    const parentRoute = this.getRoute(currentRoute.parentId);
    if (!parentRoute) return null;
    
    return {
      path: parentRoute.path,
      title: `Back to ${parentRoute.title}`,
      icon: ArrowLeft
    };
  }
  
  // Register new route (for future expansion)
  static registerRoute(route: AdminRoute): void {
    ADMIN_ROUTES.push(route);
    this.routes.set(route.id, route);
  }
  
  // Get all routes for documentation generation
  static getAllRoutes(): AdminRoute[] {
    return [...ADMIN_ROUTES];
  }
}

// Navigation helpers for components
export const useAdminNavigation = () => {
  return {
    getRoute: AdminNavigation.getRoute,
    getRouteByPath: AdminNavigation.getRouteByPath,
    getBreadcrumbs: AdminNavigation.getBreadcrumbs,
    getChildren: AdminNavigation.getChildren,
    getNavigationItems: AdminNavigation.getNavigationItems,
    hasAccess: AdminNavigation.hasAccess,
    getBackNavigation: AdminNavigation.getBackNavigation,
    registerRoute: AdminNavigation.registerRoute,
    getAllRoutes: AdminNavigation.getAllRoutes
  };
};