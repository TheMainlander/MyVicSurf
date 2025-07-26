import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, ShieldCheck, UserX, UserCheck, HelpCircle } from "lucide-react";
import type { User as UserType } from "@shared/schema";

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

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin info
  const { data: adminInfo } = useQuery<AdminInfo>({
    queryKey: ['/api/admin/info'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/info');
      return await response.json();
    }
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return await response.json();
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/role`, { role });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/info'] });
      toast({
        title: "Success",
        description: "User role updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    }
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/deactivate`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/info'] });
      toast({
        title: "Success",
        description: "User deactivated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive"
      });
    }
  });

  // Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/activate`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/info'] });
      toast({
        title: "Success",
        description: "User activated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate user",
        variant: "destructive"
      });
    }
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'admin': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <ShieldCheck className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-blue via-ocean-blue to-teal-dark">
        <Header />
        <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mt-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-blue via-ocean-blue to-teal-dark">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-white/80">Manage user accounts and permissions</p>
          
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = '/admin'}
            >
              Back to Admin Panel
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = '/admin/help'}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Admin Help
            </Button>
          </div>
        </div>

        {/* Admin Stats */}
        {adminInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{adminInfo.stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{adminInfo.stats.activeUsers}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{adminInfo.stats.adminUsers}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{adminInfo.stats.superAdminUsers}</div>
                <div className="text-sm text-gray-600">Super Admins</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Admin Info */}
        {adminInfo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRoleIcon(adminInfo.currentAdmin.role)}
                Logged in as: {adminInfo.currentAdmin.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className={getRoleBadgeColor(adminInfo.currentAdmin.role)}>
                  {adminInfo.currentAdmin.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">{adminInfo.currentAdmin.email}</span>
              </div>
              <div className="mt-4 text-sm">
                <div>Permissions:</div>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {adminInfo.permissions.canManageCarousel && <li>Manage carousel images</li>}
                  {adminInfo.permissions.canManageUsers && <li>Manage user accounts</li>}
                  {adminInfo.permissions.canManageRoles && <li>Manage user roles</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">All Users</h2>
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role || 'user')}
                      <div>
                        <div className="font-medium">{user.displayName || 'Unknown User'}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                    <Badge className={getRoleBadgeColor(user.role || 'user')}>
                      {(user.role || 'user').replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Role management - Super admin only */}
                    {adminInfo?.permissions.canManageRoles && user.id !== adminInfo.currentAdmin.id && (
                      <Select
                        value={user.role || 'user'}
                        onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {/* User activation/deactivation */}
                    {adminInfo?.permissions.canManageUsers && user.id !== adminInfo.currentAdmin.id && (
                      <>
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deactivateUserMutation.mutate(user.id)}
                            disabled={deactivateUserMutation.isPending}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateUserMutation.mutate(user.id)}
                            disabled={activateUserMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-500 flex gap-4">
                  <span>Created: {new Date(user.createdAt || '').toLocaleDateString()}</span>
                  {user.lastLoginAt && (
                    <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}