import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, CreditCard } from "lucide-react";
import SubscriptionSelection from "./subscription-selection";

type RegistrationStep = "welcome" | "subscription" | "payment" | "complete";

interface RegistrationFlowProps {
  onClose: () => void;
}

export default function RegistrationFlow({ onClose }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("welcome");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(1); // Default to free plan
  
  const handleAuthRedirect = () => {
    // Store selected plan for after authentication
    if (selectedPlan) {
      localStorage.setItem("selectedPlanAfterAuth", selectedPlan.toString());
    }
    window.location.href = "/api/login";
  };

  const handleBack = () => {
    switch (currentStep) {
      case "subscription":
        setCurrentStep("welcome");
        break;
      case "payment":
        setCurrentStep("subscription");
        break;
      default:
        onClose();
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="text-6xl">🏄‍♀️</div>
        <h2 className="text-3xl font-bold text-white">
          Welcome to VicSurf
        </h2>
        <p className="text-blue-100 text-lg max-w-md mx-auto">
          Get real-time surf conditions, forecasts, and premium insights for Victoria's best surf spots.
        </p>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={() => setCurrentStep("subscription")}
          className="w-full bg-white text-ocean-blue hover:bg-gray-100 font-semibold py-3 text-lg"
        >
          <User className="h-5 w-5 mr-2" />
          Get Started
        </Button>
        
        <Button 
          onClick={onClose}
          variant="ghost"
          className="w-full text-blue-200 hover:text-white hover:bg-white/10"
        >
          Continue Browsing
        </Button>
      </div>

      <div className="text-sm text-blue-200">
        Already have an account? Sign in with your existing credentials.
      </div>
    </div>
  );

  const renderSubscriptionStep = () => (
    <SubscriptionSelection
      onPlanSelect={setSelectedPlan}
      selectedPlan={selectedPlan}
      onContinue={() => {
        // If free plan selected, go straight to auth
        if (selectedPlan === 1) {
          handleAuthRedirect();
        } else {
          setCurrentStep("payment");
        }
      }}
    />
  );

  const renderPaymentStep = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <CreditCard className="h-12 w-12 text-white mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          Complete Your Registration
        </h2>
        <p className="text-blue-100">
          First, create your account, then we'll set up your subscription.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left">
        <h3 className="font-semibold text-white mb-2">What happens next:</h3>
        <ol className="text-sm text-blue-100 space-y-1">
          <li>1. Create your VicSurf account</li>
          <li>2. Choose your payment method</li>
          <li>3. Start tracking Victoria's best surf spots</li>
        </ol>
      </div>

      <Button 
        onClick={handleAuthRedirect}
        className="w-full bg-white text-ocean-blue hover:bg-gray-100 font-semibold py-3 text-lg"
      >
        Create Account & Subscribe
      </Button>

      <p className="text-xs text-blue-200">
        Secure payment processing powered by Stripe • Cancel anytime
      </p>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "welcome":
        return "Welcome";
      case "subscription":
        return "Choose Plan";
      case "payment":
        return "Payment";
      default:
        return "Registration";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-ocean-blue to-blue-700 border-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            {currentStep !== "welcome" && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-blue-200 hover:text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-white text-center flex-1">
              {getStepTitle()}
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-blue-200 hover:text-white hover:bg-white/10 text-xl leading-none p-2"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {currentStep === "welcome" && renderWelcomeStep()}
          {currentStep === "subscription" && renderSubscriptionStep()}
          {currentStep === "payment" && renderPaymentStep()}
        </CardContent>
      </Card>
    </div>
  );
}