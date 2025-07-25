import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Home, User, CreditCard } from "lucide-react";

export default function PaymentSuccess() {
  useEffect(() => {
    // Clear any stored payment data
    localStorage.removeItem('pendingPayment');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-blue/5 to-cyan-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-coastal-grey mb-2">
              Welcome to VicSurf Premium! Your subscription is now active.
            </p>
            <p className="text-sm text-coastal-grey">
              You now have access to enhanced surf forecasting, premium alerts, and exclusive features.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-ocean-blue mb-2">What's Next?</h3>
            <ul className="text-sm text-coastal-grey space-y-1 text-left">
              <li>• Explore 7-day detailed forecasts</li>
              <li>• Set up custom surf alerts</li>
              <li>• Access premium camera feeds</li>
              <li>• Track your surf sessions</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Link href="/">
              <Button className="w-full bg-ocean-blue hover:bg-blue-700 text-white">
                <Home className="h-4 w-4 mr-2" />
                Start Surfing
              </Button>
            </Link>
            
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </Link>
          </div>

          <div className="text-xs text-coastal-grey">
            <p>Questions? Contact our support team for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}