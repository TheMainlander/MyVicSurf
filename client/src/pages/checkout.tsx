import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Shield } from "lucide-react";
import { Link } from 'wouter';

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

// Load Stripe - check for environment variable
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ amount, planName }: { amount: number, planName: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Payment System Unavailable",
        description: "Stripe is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment processing.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: `Welcome to ${planName}! Your subscription is now active.`,
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <PaymentElement />
      </div>
      
      <div className="flex items-center justify-center space-x-2 text-sm text-coastal-grey">
        <Shield className="h-4 w-4" />
        <span>Secured by Stripe • 256-bit SSL encryption</span>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-ocean-blue hover:bg-blue-700 text-white py-3"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {isProcessing ? "Processing..." : `Pay $${(amount / 100).toFixed(2)} AUD`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [, params] = useRoute('/checkout/:planId');
  const planId = params?.planId;
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const { data: plan, isLoading: planLoading } = useQuery<SubscriptionPlan>({
    queryKey: ["/api/subscription-plans", planId],
    enabled: !!planId,
  });

  useEffect(() => {
    if (!planId || !plan) return;

    // Create PaymentIntent when component loads
    apiRequest("POST", "/api/create-payment-intent", { 
      planId: parseInt(planId),
      amount: plan.price 
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("No client secret received");
        }
      })
      .catch((error) => {
        console.error("Payment intent creation failed:", error);
        toast({
          title: "Payment Setup Failed",
          description: "Unable to initialize payment. Please try again or contact support.",
          variant: "destructive",
        });
      });
  }, [planId, plan, toast]);

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-blue/5 to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment System Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-coastal-grey mb-4">
              Payment processing is currently not configured. Please contact the administrator to set up Stripe payment processing.
            </p>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (planLoading || !clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-blue/5 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-ocean-blue border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-coastal-grey">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-blue/5 to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Plan Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-coastal-grey mb-4">
              The selected subscription plan could not be found.
            </p>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-blue/5 to-cyan-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <Link href="/pricing">
            <Button variant="ghost" className="text-ocean-blue hover:bg-blue-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Complete Your Subscription
            </CardTitle>
            <div className="text-center p-4 bg-blue-50 rounded-lg mt-4">
              <h3 className="font-semibold text-ocean-blue">{plan.displayName}</h3>
              <p className="text-sm text-coastal-grey">{plan.description}</p>
              <div className="text-2xl font-bold text-ocean-blue mt-2">
                ${(plan.price / 100).toFixed(2)} AUD/{plan.interval}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm amount={plan.price} planName={plan.displayName} />
            </Elements>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-coastal-grey">
          <p>Cancel anytime • No hidden fees • 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
}