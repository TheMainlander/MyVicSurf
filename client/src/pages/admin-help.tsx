import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Users, 
  Shield, 
  ShieldCheck, 
  Settings, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react";
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";
import AdminQuickNav from "@/components/admin/admin-quick-nav";

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

const helpSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Book className="h-5 w-5" />,
    content: [
      {
        title: "Accessing Admin Functions",
        items: [
          "Sign in using Replit Auth (click 'Sign In' button)",
          "Navigate to /admin for carousel management", 
          "Navigate to /admin/users for user administration",
          "Navigate to /admin/help for this guide"
        ]
      },
      {
        title: "Your Admin Dashboard",
        items: [
          "View system statistics and user counts",
          "Quick access to all admin functions",
          "Monitor your current permissions and role"
        ]
      }
    ]
  },
  {
    id: "user-roles",
    title: "User Roles & Permissions",
    icon: <Shield className="h-5 w-5" />,
    content: [
      {
        title: "Role Hierarchy",
        items: [
          "Super Admin - Full system access and role management",
          "Admin - Carousel and user management (cannot change roles)",
          "User - Standard surf platform features only"
        ]
      },
      {
        title: "Permission Matrix",
        items: [
          "Carousel Management: Admin + Super Admin",
          "User Viewing: Admin + Super Admin", 
          "Account Activation: Admin + Super Admin",
          "Role Changes: Super Admin only"
        ]
      }
    ]
  },
  {
    id: "carousel-management", 
    title: "Carousel Management",
    icon: <ImageIcon className="h-5 w-5" />,
    content: [
      {
        title: "Managing Featured Images",
        items: [
          "Add high-quality surf spot images (minimum 1200x600px)",
          "Include descriptive names and locations",
          "Use sort order to control display sequence",
          "Test images on mobile devices for responsiveness"
        ]
      },
      {
        title: "Image Requirements",
        items: [
          "Format: JPG, PNG, or WebP recommended",
          "Size: Keep under 2MB for fast loading",
          "Aspect Ratio: 2:1 (landscape) works best",
          "Content: Authentic Victorian surf location photos"
        ]
      }
    ]
  },
  {
    id: "user-management",
    title: "User Management", 
    icon: <Users className="h-5 w-5" />,
    content: [
      {
        title: "User Administration",
        items: [
          "View all user accounts and activity statistics",
          "Activate or deactivate user accounts as needed",
          "Monitor login patterns and account creation dates",
          "Track subscription status and user engagement"
        ]
      },
      {
        title: "Creating Admins (Super Admin Only)",
        items: [
          "Go to /admin/users and find the target user",
          "Change their role using the dropdown menu",
          "User immediately gains admin access after role change",
          "Always follow principle of least privilege"
        ]
      }
    ]
  },
  {
    id: "security",
    title: "Security Best Practices",
    icon: <ShieldCheck className="h-5 w-5" />,
    content: [
      {
        title: "Admin Account Security",
        items: [
          "Limit the number of super admin accounts",
          "Regularly audit admin access and activity",
          "Deactivate unused or unnecessary admin accounts",
          "Monitor for suspicious authentication attempts"
        ]
      },
      {
        title: "Role Assignment Guidelines",
        items: [
          "Grant minimum necessary permissions only",
          "Require business justification for admin promotions",
          "Document all role changes with reasons",
          "Review admin access during security audits"
        ]
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: <AlertTriangle className="h-5 w-5" />,
    content: [
      {
        title: "Common Issues",
        items: [
          "'Authentication Required' - Sign in with Replit Auth",
          "'Admin Access Required' - Contact super admin for role upgrade", 
          "'Insufficient Permissions' - Super admin access needed",
          "Routes not accessible - Check authentication status"
        ]
      },
      {
        title: "Getting Help",
        items: [
          "Check this admin guide for standard procedures",
          "Contact super admins for role management issues",
          "Review server logs for technical problems",
          "Report security concerns immediately"
        ]
      }
    ]
  }
];

export default function AdminHelpPage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  // Fetch admin info
  const { data: adminInfo } = useQuery<AdminInfo>({
    queryKey: ['/api/admin/info'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/info');
      return await response.json();
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <ShieldCheck className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-300">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">
        <AdminNavigationHeader
          currentPath="/admin/help"
          title="Admin Help & Documentation"
          description="Comprehensive guide for VicSurf administration"
          additionalActions={
            <Button
              variant="outline"
              className="border-gray-600 text-gray-800 hover:bg-gray-200"
              onClick={() => window.location.href = '/admin/users'}
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
          }
        />
        
        <AdminQuickNav currentPath="/admin/help" userRole="super_admin" />

        {/* Admin Status Card */}
        {adminInfo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                {getRoleIcon(adminInfo.currentAdmin.role)}
                Admin Status: {adminInfo.currentAdmin.displayName || adminInfo.currentAdmin.email}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={getRoleBadgeColor(adminInfo.currentAdmin.role)}>
                  {adminInfo.currentAdmin.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-black">{adminInfo.currentAdmin.email}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{adminInfo.stats.totalUsers}</div>
                  <div className="text-sm text-gray-900">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{adminInfo.stats.activeUsers}</div>
                  <div className="text-sm text-gray-900">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{adminInfo.stats.adminUsers}</div>
                  <div className="text-sm text-gray-900">Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{adminInfo.stats.superAdminUsers}</div>
                  <div className="text-sm text-gray-900">Super Admins</div>
                </div>
              </div>

              <div className="text-sm">
                <div className="font-medium mb-2 text-black">Your Permissions:</div>
                <div className="flex flex-wrap gap-2">
                  {adminInfo.permissions.canManageCarousel && (
                    <Badge variant="outline" className="text-black border-gray-300">Manage Carousel</Badge>
                  )}
                  {adminInfo.permissions.canManageUsers && (
                    <Badge variant="outline" className="text-black border-gray-300">Manage Users</Badge>
                  )}
                  {adminInfo.permissions.canManageRoles && (
                    <Badge variant="outline" className="text-black border-gray-300">Manage Roles</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => window.location.href = '/admin'}>
            <CardContent className="p-4 flex items-center gap-3">
              <ImageIcon className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-medium text-black">Carousel Management</div>
                <div className="text-sm text-gray-900">Manage landing page images</div>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => window.location.href = '/admin/users'}>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-black">User Management</div>
                <div className="text-sm text-gray-900">Manage user accounts</div>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => window.open('/ADMIN_GUIDE.md', '_blank')}>
            <CardContent className="p-4 flex items-center gap-3">
              <Book className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium text-black">Full Documentation</div>
                <div className="text-sm text-gray-900">Complete admin guide</div>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
            </CardContent>
          </Card>
        </div>

        {/* Help Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <HelpCircle className="h-5 w-5" />
              Admin Guide Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {helpSections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id} className="text-xs">
                    <span className="hidden sm:flex items-center gap-1">
                      {section.icon}
                      {section.title}
                    </span>
                    <span className="sm:hidden">{section.icon}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {helpSections.map((section) => (
                <TabsContent key={section.id} value={section.id} className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      {section.icon}
                      <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    </div>
                    
                    {section.content.map((subsection, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white/10 backdrop-blur-sm">
                        <h3 className="font-medium mb-3 text-white">{subsection.title}</h3>
                        <ul className="space-y-2">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-black">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}