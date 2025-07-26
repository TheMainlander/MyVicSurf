import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import FavoritesList from "@/components/favorites/favorites-list";
import NotificationSettings from "@/components/notifications/notification-settings";
import EditProfileForm from "@/components/profile/edit-profile-form";
import ProfileDisplay from "@/components/profile/profile-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings, Bell, MapPin, Thermometer, Info } from "lucide-react";
import APISettings from "@/components/settings/api-settings";
import { SettingsWithLocation } from "@/components/settings/settings-list";
import type { User } from "@shared/schema";

export default function Profile() {
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch user profile data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/users/${currentUserId}`],
    enabled: !!currentUserId,
  });

  // Create mock user if none exists
  const mockUser: User = {
    id: currentUserId,
    email: "surfer@example.com",
    firstName: "Alex",
    lastName: "Surfer",
    displayName: "Wave Rider",
    profileImageUrl: null,
    location: "Melbourne, Victoria",
    bio: "Passionate surfer exploring Victoria's amazing coastline. Love catching waves at Bells Beach!",
    surfingExperience: "intermediate",
    phoneNumber: "+61 4XX XXX XXX",
    instagramHandle: "@alexsurfer",
    twitterHandle: "@alexsurfer_vic",
    facebookHandle: "alexsurfer.vic",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: "free",
    subscriptionPlan: null,
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    role: "user",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
  };

  const currentUser = user || mockUser;
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        <section className="py-6">
          <div className="space-y-4">
            {/* Profile Section */}
            {isEditingProfile ? (
              <EditProfileForm 
                user={currentUser} 
                onCancel={() => setIsEditingProfile(false)} 
              />
            ) : (
              <ProfileDisplay 
                user={currentUser} 
                onEdit={() => setIsEditingProfile(true)} 
              />
            )}
            
            {/* Favorites List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 text-ocean-blue mr-2" />
                  My Favorite Beaches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FavoritesList userId={currentUserId} />
              </CardContent>
            </Card>
            
            {/* Notification Settings */}
            <NotificationSettings userId={currentUserId} />
            
            {/* API Settings */}
            <APISettings />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 text-ocean-blue mr-2" />
                  Session Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-ocean-blue">12</div>
                    <div className="text-sm text-coastal-grey">Sessions This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-wave-green">3.2</div>
                    <div className="text-sm text-coastal-grey">Avg Wave Height</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Section */}
            <SettingsWithLocation userId={currentUserId} />
          </div>
        </section>
      </main>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}
