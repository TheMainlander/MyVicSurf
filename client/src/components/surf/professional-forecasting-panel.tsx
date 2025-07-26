import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Crown, Lock } from "lucide-react";

export default function ProfessionalForecastingPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        {/* Header - Always visible */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Professional Surf Forecasting</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Premium</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600 text-sm">
              Unlock advanced metrics used by professional surfers and forecasters
            </p>

            {/* Feature List */}
            <div className="space-y-3">
              {[
                "Professional 10-point scoring system",
                "Wave energy calculations (Height² × Period)",
                "Multi-swell analysis and interaction",
                "Swell quality classification (ground vs wind)",
                "Environmental metrics (UV, visibility, rain)",
                "Quality breakdown charts and analysis"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Lock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Pricing Options */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-600">$9.99</div>
                <div className="text-sm text-gray-600">Wave Rider</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-purple-200 text-center">
                <div className="text-2xl font-bold text-purple-600">$19.99</div>
                <div className="text-sm text-gray-600">Surf Master</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 mt-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/pricing'}
              >
                Upgrade Now
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => window.location.href = '/pricing'}
              >
                Learn More
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-3">
              Join professional surfers using advanced forecasting
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}