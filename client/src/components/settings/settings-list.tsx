import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, MapPin, Thermometer, Info, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserPreferences, SurfSpot } from "@shared/schema";

interface SettingsListProps {
  userId: string;
}

export default function SettingsList({ userId }: SettingsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/users", userId, "preferences"],
    enabled: !!userId,
  });

  // Fetch surf spots for default location selection
  const { data: surfSpots } = useQuery<SurfSpot[]>({
    queryKey: ["/api/surf-spots"],
  });

  const updatePreferences = useMutation({
    mutationFn: async (newSettings: Partial<UserPreferences>) => {
      await apiRequest("PUT", `/api/users/${userId}/preferences`, newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", userId, "preferences"] 
      });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof UserPreferences, value: any) => {
    updatePreferences.mutate({ [key]: value });
  };

  const getUnitsDisplay = () => {
    return preferences?.preferredUnits === "metric" ? "Metric" : "Imperial";
  };

  const getDefaultLocationDisplay = () => {
    if (!preferences?.defaultLocation) return "Not set";
    if (!surfSpots || surfSpots.length === 0) return "Loading...";
    const spot = surfSpots?.find(s => s.id.toString() === preferences.defaultLocation);
    return spot?.name || "Unknown location";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Settings className="h-5 w-5 text-coastal-grey mr-2" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Surf Alerts */}
        <Dialog open={openDialog === "alerts"} onOpenChange={(open) => setOpenDialog(open ? "alerts" : null)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Surf Alerts
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={preferences?.optimalConditionAlerts ? "default" : "secondary"}>
                  {preferences?.optimalConditionAlerts ? "On" : "Off"}
                </Badge>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Surf Alerts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Optimal Condition Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your favorite spots have great conditions
                  </p>
                </div>
                <Switch
                  checked={preferences?.optimalConditionAlerts ?? true}
                  onCheckedChange={(checked) => handleSettingChange('optimalConditionAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable browser push notifications
                  </p>
                </div>
                <Switch
                  checked={preferences?.pushNotifications ?? true}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Default Location */}
        <Dialog open={openDialog === "location"} onOpenChange={(open) => setOpenDialog(open ? "location" : null)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Default Location
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{getDefaultLocationDisplay()}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Default Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Preferred Surf Spot</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose your default surf spot for quick access
                </p>
                <Select
                  value={preferences?.defaultLocation || ""}
                  onValueChange={(value) => handleSettingChange('defaultLocation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a surf spot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No default location</SelectItem>
                    {surfSpots && surfSpots.length > 0 ? (
                      surfSpots.map((spot) => (
                        <SelectItem key={spot.id} value={spot.id.toString()}>
                          {spot.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading locations...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Units */}
        <Dialog open={openDialog === "units"} onOpenChange={(open) => setOpenDialog(open ? "units" : null)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 mr-2" />
                Units ({getUnitsDisplay()})
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Measurement Units</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Preferred Units</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose how measurements are displayed
                </p>
                <Select
                  value={preferences?.preferredUnits || "metric"}
                  onValueChange={(value) => handleSettingChange('preferredUnits', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">
                      <div>
                        <div className="font-medium">Metric</div>
                        <div className="text-sm text-muted-foreground">
                          Meters, Celsius, km/h
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="imperial">
                      <div>
                        <div className="font-medium">Imperial</div>
                        <div className="text-sm text-muted-foreground">
                          Feet, Fahrenheit, mph
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* About VicSurf */}
        <Dialog open={openDialog === "about"} onOpenChange={(open) => setOpenDialog(open ? "about" : null)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                About VicSurf
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About VicSurf</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-4">🏄‍♀️</div>
                <h3 className="text-xl font-semibold mb-2">VicSurf</h3>
                <p className="text-muted-foreground mb-4">Victoria Surf Conditions Tracker</p>
                <Badge variant="secondary">Version 1.0.0</Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Features</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Real-time surf conditions for Victorian beaches</li>
                    <li>• 7-day surf forecasts</li>
                    <li>• Tide times and charts</li>
                    <li>• Beach camera feeds</li>
                    <li>• Personalized surf alerts</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Data Sources</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Open-Meteo Marine Weather API</li>
                    <li>• Bureau of Meteorology (Australia)</li>
                    <li>• Local surf camera networks</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t text-center text-muted-foreground">
                  <p>Built with ❤️ for Victorian surfers</p>
                  <p className="text-xs mt-1">© 2025 VicSurf</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}