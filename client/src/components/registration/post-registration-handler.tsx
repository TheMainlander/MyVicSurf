import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, CreditCard, Home } from "lucide-react";

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

export default function PostRegistrationHandler() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: plan } = useQuery<SubscriptionPlan>({
    queryKey: ["/api/subscription-plans", selectedPlanId],
    enabled: !!selectedPlanId,
  });

  useEffect(() => {
    // Check if user just completed registration with a plan selection
    const storedPlanId = localStorage.getItem("selectedPlanAfterAuth");
    
    if (isAuthenticated && storedPlanId) {
      setSelectedPlanId(storedPlanId);
      setShowWelcome(true);
      
      // Clear the stored plan ID after processing
      localStorage.removeItem("selectedPlanAfterAuth");
    }
  }, [isAuthenticated]);

  const handleContinueToCheckout = () => {
    if (selectedPlanId) {
      setLocation(`/checkout/${selectedPlanId}`);
    }
  };

  const handleSkipToApp = () => {
    setShowWelcome(false);
    setLocation("/");
  };

  if (isLoading || !isAuthenticated || !showWelcome || !plan) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-to-br from-ocean-blue to-blue-700 border-none text-white">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-300" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to VicSurf!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-blue-100 mb-4">
              Your account has been created successfully. Ready to complete your subscription?
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Selected Plan:</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{plan.displayName}</div>
                <div className="text-sm text-blue-200">{plan.description}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)} AUD`}
                </div>
                {plan.price > 0 && (
                  <div className="text-xs text-blue-200">per {plan.interval}</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {plan.price === 0 ? (
              <Button 
                onClick={handleSkipToApp}
                className="w-full bg-white text-ocean-blue hover:bg-gray-100 font-semibold py-3"
              >
                <Home className="h-4 w-4 mr-2" />
                Start Using VicSurf
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleContinueToCheckout}
                  className="w-full bg-white text-ocean-blue hover:bg-gray-100 font-semibold py-3"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Subscription
                </Button>
                
                <Button 
                  onClick={handleSkipToApp}
                  variant="ghost"
                  className="w-full text-blue-200 hover:text-white hover:bg-white/10"
                >
                  Skip for Now
                </Button>
              </>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-blue-200">
              You can always upgrade or change your plan later in your account settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}