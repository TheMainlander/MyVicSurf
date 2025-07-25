import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Waves, Zap, Crown } from "lucide-react";

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
}

interface SubscriptionSelectionProps {
  onPlanSelect: (planId: number | null) => void;
  selectedPlan: number | null;
  onContinue: () => void;
}

export default function SubscriptionSelection({ 
  onPlanSelect, 
  selectedPlan, 
  onContinue 
}: SubscriptionSelectionProps) {
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formattedPrice = (price / 100).toFixed(2);
    const currencySymbol = currency === "aud" ? "$" : currency.toUpperCase();
    return `${currencySymbol}${formattedPrice}/${interval}`;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Waves className="h-6 w-6 text-ocean-blue" />;
      case "premium":
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case "pro":
        return <Crown className="h-6 w-6 text-purple-500" />;
      default:
        return <Waves className="h-6 w-6 text-ocean-blue" />;
    }
  };

  const getPlanColor = (planName: string, isSelected: boolean) => {
    const base = isSelected ? "ring-2 ring-ocean-blue bg-blue-50/50" : "hover:shadow-md";
    switch (planName.toLowerCase()) {
      case "free":
        return `border-blue-200 ${base}`;
      case "premium":
        return `border-yellow-200 bg-yellow-50/30 ${base}`;
      case "pro":
        return `border-purple-200 bg-purple-50/30 ${base}`;
      default:
        return `border-blue-200 ${base}`;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-ocean-blue border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-coastal-grey">Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Your VicSurf Experience
        </h2>
        <p className="text-blue-100">
          Start with any plan and upgrade anytime. All plans include basic surf conditions.
        </p>
      </div>

      <div className="grid gap-4">
        {plans?.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative cursor-pointer transition-all duration-300 ${getPlanColor(plan.name, selectedPlan === plan.id)}`}
            onClick={() => onPlanSelect(plan.id)}
          >
            {plan.name === "premium" && (
              <div className="absolute -top-2 right-4">
                <Badge className="bg-yellow-500 text-white px-3 py-1 text-xs">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPlanIcon(plan.name)}
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {plan.displayName}
                    </CardTitle>
                    <div className="text-lg font-bold text-ocean-blue">
                      {plan.price === 0 ? "Free" : formatPrice(plan.price, plan.currency, plan.interval)}
                    </div>
                  </div>
                </div>
                {selectedPlan === plan.id && (
                  <div className="w-6 h-6 bg-ocean-blue rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-coastal-grey mb-3">{plan.description}</p>
              <div className="space-y-1">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600">
                    <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.features.length > 3 && (
                  <div className="text-xs text-coastal-grey">
                    + {plan.features.length - 3} more features
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <Button 
          onClick={onContinue}
          disabled={selectedPlan === null}
          className="w-full bg-white text-ocean-blue hover:bg-gray-100 font-semibold py-3 text-lg"
        >
          Continue with {plans?.find(p => p.id === selectedPlan)?.displayName || "Selected Plan"}
        </Button>
        
        <p className="text-xs text-blue-200">
          You can always change your plan later in your account settings
        </p>
      </div>
    </div>
  );
}