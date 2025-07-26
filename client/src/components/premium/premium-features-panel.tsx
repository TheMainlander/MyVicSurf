import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, BarChart3, Waves, Eye, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { User } from "@shared/schema";

interface PremiumFeaturesPanelProps {
  className?: string;
}

export default function PremiumFeaturesPanel({ className = "" }: PremiumFeaturesPanelProps) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const isPremiumUser = user?.subscriptionPlan && ['wave_rider', 'surf_master'].includes(user.subscriptionPlan);
  const isSurfMaster = user?.subscriptionPlan === 'surf_master';

  // Show different content based on subscription status
  if (isPremiumUser) {
    return (
      <Card className={`surf-card ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-blue-600" />
            Professional Features Active
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              {user.subscriptionPlan === 'wave_rider' ? 'Wave Rider' : 'Surf Master'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>10-Point Scoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Waves className="h-4 w-4 text-blue-600" />
              <span>Wave Energy</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span>Multi-Swell Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-orange-600" />
              <span>Environmental Data</span>
            </div>
          </div>

          {!isSurfMaster && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-purple-900 mb-1">
                Upgrade to Surf Master
              </div>
              <div className="text-xs text-purple-700 mb-2">
                Advanced tide modeling, spot-specific recommendations, and more
              </div>
              <Link href="/pricing">
                <Button size="sm" variant="outline" className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Free user - show premium upgrade options
  return (
    <Card className={`surf-card ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-blue-600" />
          Professional Surf Forecasting
          <Badge className="bg-blue-100 text-blue-800 text-xs">Premium</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700">
          Unlock advanced metrics used by professional surfers and forecasters
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-blue-500" />
            <span>Professional 10-point scoring system</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-blue-500" />
            <span>Wave energy calculations (Height² × Period)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-blue-500" />
            <span>Multi-swell analysis and interaction</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-blue-500" />
            <span>Swell quality classification (ground vs wind)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-blue-500" />
            <span>Environmental metrics (UV, visibility, rain)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-blue-500" />
            <span>Quality breakdown charts and analysis</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">$9.99</div>
            <div className="text-xs text-blue-800">Wave Rider</div>
            <div className="text-xs text-gray-600">per month</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">$19.99</div>
            <div className="text-xs text-purple-800">Surf Master</div>
            <div className="text-xs text-gray-600">per month</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/pricing" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Upgrade Now
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="sm" className="text-xs">
              Learn More
            </Button>
          </Link>
        </div>

        <div className="text-xs text-center text-gray-500">
          Join professional surfers using advanced forecasting
        </div>
      </CardContent>
    </Card>
  );
}