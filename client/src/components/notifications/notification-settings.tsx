import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { apiRequest } from "@/lib/queryClient";
import type { UserPreferences } from "@shared/schema";

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    isSubscribing,
    isUnsubscribing,
  } = usePushNotifications(userId);

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/users", userId, "preferences"],
    enabled: !!userId,
  });

  const [settings, setSettings] = useState({
    pushNotifications: preferences?.pushNotifications ?? true,
    optimalConditionAlerts: preferences?.optimalConditionAlerts ?? true,
    waveHeightMin: preferences?.waveHeightMin ?? 1.0,
    waveHeightMax: preferences?.waveHeightMax ?? 4.0,
    windSpeedMax: preferences?.windSpeedMax ?? 20,
  });

  const updatePreferences = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      await apiRequest("PUT", `/api/users/${userId}/preferences`, newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", userId, "preferences"] 
      });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
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

  const handleSettingsChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updatePreferences.mutate(newSettings);
  };

  const handlePushToggle = () => {
    if (isSubscribed) {
      unsubscribe();
      handleSettingsChange('pushNotifications', false);
    } else {
      subscribe();
      handleSettingsChange('pushNotifications', true);
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <i className="fas fa-bell text-ocean-blue mr-2"></i>
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <i className="fas fa-exclamation-triangle text-4xl text-warning-orange mb-3"></i>
            <p className="text-coastal-grey">
              Push notifications are not supported on this device
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <i className="fas fa-bell text-ocean-blue mr-2"></i>
          Push Notifications
          {getPermissionBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="push-notifications">Enable Push Notifications</Label>
            <p className="text-sm text-coastal-grey">
              Get notified when optimal surf conditions are detected
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed && settings.pushNotifications}
            onCheckedChange={handlePushToggle}
            disabled={isSubscribing || isUnsubscribing || permission === 'denied'}
          />
        </div>

        {/* Permission denied message */}
        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              Notifications are blocked. Please enable them in your browser settings to receive surf alerts.
            </p>
          </div>
        )}

        {/* Optimal Conditions Alert Settings */}
        {isSubscribed && settings.pushNotifications && (
          <>
            <hr />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="optimal-alerts">Optimal Condition Alerts</Label>
                  <p className="text-sm text-coastal-grey">
                    Get notified when your favorite spots have great conditions
                  </p>
                </div>
                <Switch
                  id="optimal-alerts"
                  checked={settings.optimalConditionAlerts}
                  onCheckedChange={(checked) => 
                    handleSettingsChange('optimalConditionAlerts', checked)
                  }
                />
              </div>

              {settings.optimalConditionAlerts && (
                <div className="space-y-4 pl-4 border-l-2 border-ocean-blue/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wave-height-min">Min Wave Height (m)</Label>
                      <Input
                        id="wave-height-min"
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="10"
                        value={settings.waveHeightMin}
                        onChange={(e) => 
                          handleSettingsChange('waveHeightMin', parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wave-height-max">Max Wave Height (m)</Label>
                      <Input
                        id="wave-height-max"
                        type="number"
                        step="0.1"
                        min="1"
                        max="15"
                        value={settings.waveHeightMax}
                        onChange={(e) => 
                          handleSettingsChange('waveHeightMax', parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wind-speed-max">Max Wind Speed (km/h)</Label>
                    <Input
                      id="wind-speed-max"
                      type="number"
                      step="1"
                      min="0"
                      max="50"
                      value={settings.windSpeedMax}
                      onChange={(e) => 
                        handleSettingsChange('windSpeedMax', parseFloat(e.target.value))
                      }
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      <i className="fas fa-info-circle mr-1"></i>
                      Notifications are sent once per day for each favorite spot when conditions match your preferences.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Test Notification Button */}
        {isSubscribed && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('VicSurf Test', {
                    body: 'Notifications are working! You\'ll receive alerts for optimal surf conditions.',
                    icon: '/icon-192x192.png'
                  });
                }
              }}
            >
              <i className="fas fa-bell-slash mr-2"></i>
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}