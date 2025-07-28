import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, HelpCircle, TrendingUp, Image as ImageIcon, ChevronRight, ExternalLink, FileText, MapPin, Settings } from "lucide-react";
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";

interface AdminInfo {
  currentAdmin: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
  stats: {
    totalUsers: number;
    adminUsers: number;
    superAdminUsers: number;
    activeUsers: number;
  };
  permissions: {
    canManageUsers: boolean;
    canManageRoles: boolean;
    canManageCarousel: boolean;
  };
}

interface AdminPanelData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  requiresRole?: 'admin' | 'super_admin';
}

export default function AdminPage() {
  // Fetch admin info and stats
  const { data: adminInfo, isLoading } = useQuery<AdminInfo>({
    queryKey: ['/api/admin/info'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/info');
      return await response.json();
    }
  });

  // Fetch carousel images for stats
  const { data: carouselStats } = useQuery({
    queryKey: ['/api/admin/carousel-images'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/carousel-images');
      const images = await response.json();
      return { count: images.length };
    }
  });

  // Fetch marketing documents for stats
  const { data: marketingStats } = useQuery({
    queryKey: ['/api/admin/marketing-documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/marketing-documents');
      const documents = await response.json();
      return { count: documents.length };
    }
  });

  // Fetch beach/surf spot stats
  const { data: beachStats } = useQuery({
    queryKey: ['/api/surf-spots'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/surf-spots');
      const spots = await response.json();
      return { count: spots.length };
    }
  });

  const adminPanels: AdminPanelData[] = [
    {
      id: 'beach-management',
      title: 'Beach Management',
      description: 'Manage Victoria beaches & surf spots',
      icon: <MapPin className="h-8 w-8 text-teal-600" />,
      path: '/admin/beaches',
      badge: beachStats ? `${beachStats.count} beaches` : undefined,
      requiresRole: 'admin'
    },
    {
      id: 'carousel-management',
      title: 'Carousel Management',
      description: 'Manage landing page images',
      icon: <ImageIcon className="h-8 w-8 text-blue-600" />,
      path: '/admin/carousel',
      badge: carouselStats ? `${carouselStats.count} images` : undefined,
      requiresRole: 'admin'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts',
      icon: <Users className="h-8 w-8 text-green-600" />,
      path: '/admin/users',
      badge: adminInfo ? `${adminInfo.stats.totalUsers} users` : undefined,
      requiresRole: 'admin'
    },
    {
      id: 'sales-marketing',
      title: 'Sales & Marketing',
      description: 'Marketing documents and campaigns',
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      path: '/admin/sales-marketing',
      badge: marketingStats ? `${marketingStats.count} documents` : undefined,
      requiresRole: 'admin'
    },
    {
      id: 'system-documents',
      title: 'System Documents',
      description: 'PRDs, specifications, and technical docs',
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      path: '/admin/system-documents',
      badge: 'PRDs & Specs',
      requiresRole: 'admin'
    },
    {
      id: 'container-order',
      title: 'Container Order',
      description: 'Customize admin panel layout',
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      path: '/admin/container-order',
      badge: 'Layout Control',
      requiresRole: 'admin'
    },
    {
      id: 'documentation',
      title: 'Full Documentation',
      description: 'Complete admin guide',
      icon: <HelpCircle className="h-8 w-8 text-indigo-600" />,
      path: '/admin/help',
      badge: 'Help & Guides',
      requiresRole: 'admin'
    }
  ];

  const hasAccess = (panel: AdminPanelData): boolean => {
    if (!panel.requiresRole || !adminInfo) return true;
    
    const roleHierarchy = ['user', 'admin', 'super_admin'];
    const userRoleLevel = roleHierarchy.indexOf(adminInfo.currentAdmin.role);
    const requiredRoleLevel = roleHierarchy.indexOf(panel.requiresRole);
    
    return userRoleLevel >= requiredRoleLevel;
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-300">
        <Header />
        <main className="max-w-4xl mx-auto px-4 pb-20 pt-6">
          <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full mx-auto mt-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pb-20 pt-6">
        <AdminNavigationHeader
          currentPath="/admin"
          title="Admin Panel"
          description="Centralized administration dashboard for VicSurf"
        />
        
        {/* Admin Overview Stats */}
        {adminInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{adminInfo.stats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{adminInfo.stats.activeUsers}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{carouselStats?.count || 0}</div>
                  <div className="text-sm text-gray-600">Carousel Images</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{marketingStats?.count || 0}</div>
                  <div className="text-sm text-gray-600">Marketing Docs</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Panels */}
        <div className="space-y-4">
          {adminPanels
            .filter(panel => hasAccess(panel))
            .map((panel) => (
              <Card 
                key={panel.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => window.location.href = panel.path}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {panel.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                          {panel.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {panel.description}
                        </p>
                        {panel.badge && (
                          <Badge variant="secondary" className="mt-2">
                            {panel.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Current Admin Info */}
        {adminInfo && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-gray-900">Current Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin:</span>
                  <span className="text-gray-900 font-medium">{adminInfo.currentAdmin.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{adminInfo.currentAdmin.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <Badge variant={adminInfo.currentAdmin.role === 'super_admin' ? 'default' : 'secondary'}>
                    {adminInfo.currentAdmin.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}