import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Waves, Zap, Crown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

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

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

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
        return <Waves className="h-8 w-8 text-ocean-blue" />;
      case "premium":
        return <Zap className="h-8 w-8 text-yellow-500" />;
      case "pro":
        return <Crown className="h-8 w-8 text-purple-500" />;
      default:
        return <Waves className="h-8 w-8 text-ocean-blue" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return "border-blue-200";
      case "premium":
        return "border-yellow-200 bg-yellow-50/30";
      case "pro":
        return "border-purple-200 bg-purple-50/30";
      default:
        return "border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ocean-blue/5 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-ocean-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-blue/5 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-ocean-blue to-cyan-600 bg-clip-text text-transparent mb-4">
            VicSurf Premium Plans
          </h1>
          <p className="text-xl text-coastal-grey max-w-2xl mx-auto">
            Unlock advanced surf forecasting, premium alerts, and exclusive features to enhance your surfing experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.name)} hover:shadow-lg transition-all duration-300 ${
                selectedPlan === plan.id ? 'ring-2 ring-ocean-blue' : ''
              }`}
            >
              {plan.name === "premium" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.displayName}
                </CardTitle>
                <div className="text-3xl font-bold text-ocean-blue">
                  {plan.price === 0 ? "Free" : formatPrice(plan.price, plan.currency, plan.interval)}
                </div>
                <CardDescription className="text-coastal-grey">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isAuthenticated ? (
                  plan.price === 0 ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Link href={`/subscribe/${plan.id}`}>
                      <Button 
                        className="w-full bg-ocean-blue hover:bg-blue-700 text-white"
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        Subscribe Now
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link href="/api/login">
                    <Button className="w-full bg-ocean-blue hover:bg-blue-700 text-white">
                      Sign In to Subscribe
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need a Custom Plan?
          </h2>
          <p className="text-coastal-grey mb-6 max-w-2xl mx-auto">
            Contact us for enterprise features, API access, or custom surf monitoring solutions for surf schools and businesses.
          </p>
          <Button variant="outline" className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue hover:text-white">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}