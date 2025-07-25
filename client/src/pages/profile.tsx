import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import FavoritesList from "@/components/favorites/favorites-list";
import NotificationSettings from "@/components/notifications/notification-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import APISettings from "@/components/settings/api-settings";

export default function Profile() {
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        <section className="py-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-ocean-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user text-2xl text-white"></i>
            </div>
            <h2 className="text-xl font-semibold">Surf Profile</h2>
            <p className="text-coastal-grey text-sm">Track your surf sessions</p>
          </div>

          <div className="space-y-4">
            {/* Favorites List */}
            <FavoritesList userId={currentUserId} maxItems={3} />
            
            {/* Notification Settings */}
            <NotificationSettings userId={currentUserId} />
            
            {/* API Settings */}
            <APISettings />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <i className="fas fa-chart-bar text-ocean-blue mr-2"></i>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <i className="fas fa-heart text-coral mr-2"></i>
                  Favorite Spots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Bells Beach</span>
                    <Badge variant="outline">8 sessions</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Winkipop</span>
                    <Badge variant="outline">5 sessions</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Jan Juc</span>
                    <Badge variant="outline">3 sessions</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <i className="fas fa-cog text-coastal-grey mr-2"></i>
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-bell mr-2"></i>
                  Surf Alerts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Default Location
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-thermometer-half mr-2"></i>
                  Units (Metric)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-info-circle mr-2"></i>
                  About VicSurf
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}
