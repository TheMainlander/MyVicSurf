import { 
  Settings, 
  Users, 
  HelpCircle, 
  Image as ImageIcon, 
  Home,
  ArrowLeft,
  Shield,
  LucideIcon,
  FileText,
  MapPin
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
  
  // Carousel management
  {
    id: 'admin-carousel',
    path: '/admin/carousel',
    title: 'Carousel Management',
    description: 'Manage landing page images',
    icon: ImageIcon,
    parentId: 'admin-root',
    requiresRole: 'admin',
    showInNavigation: true
  },
  {
    id: 'admin-beaches',
    path: '/admin/beaches',
    title: 'Beach Management',
    description: 'Edit beach information, images, and content',
    icon: MapPin,
    parentId: 'admin-root',
    requiresRole: 'admin',
    showInNavigation: true
  },
  
  // Sales & Marketing
  {
    id: 'admin-sales-marketing',
    path: '/admin/sales-marketing',
    title: 'Sales & Marketing',
    description: 'Manage marketing documents, strategies, and campaigns',
    icon: FileText,
    parentId: 'admin-root',
    requiresRole: 'admin',
    showInNavigation: true
  },
  
  // System Documents
  {
    id: 'admin-system-documents',
    path: '/admin/system-documents',
    title: 'System Documents',
    description: 'Manage PRDs, specifications, and technical documentation',
    icon: FileText,
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
    
    // If no route found or it's the admin root, show "Back to App"
    if (!currentRoute || currentRoute.id === 'admin-root') {
      return {
        path: '/',
        title: 'Back to App',
        icon: ArrowLeft
      };
    }
    
    // If no parent, go to admin root (for admin pages without defined parents)
    if (!currentRoute.parentId) {
      return {
        path: '/admin',
        title: 'Back to Admin Panel',
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