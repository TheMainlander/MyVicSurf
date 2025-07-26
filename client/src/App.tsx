import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Spots from "@/pages/spots";
import Spot from "@/pages/spot";
import Comparison from "@/pages/comparison";
import Forecast from "@/pages/forecast";
import Profile from "@/pages/profile";
import Favorites from "@/pages/favorites";
import Landing from "@/pages/landing";
import Pricing from "@/pages/pricing";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import AdminPage from "@/pages/admin";
import AdminUsersPage from "@/pages/admin-users";
import AdminHelpPage from "@/pages/admin-help";
import AdminSalesMarketingPage from "@/pages/admin-sales-marketing";
import AdminCarouselPage from "@/pages/admin-carousel";
import PostRegistrationHandler from "@/components/registration/post-registration-handler";
import Feedback from "@/pages/feedback";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Always available routes */}
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      
      {/* Admin routes - always accessible for auth redirects */}
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/carousel" component={AdminCarouselPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/sales-marketing" component={AdminSalesMarketingPage} />
      <Route path="/admin/help" component={AdminHelpPage} />
      
      {/* Main app routes */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/spots" component={Spots} />
      <Route path="/spot/:id" component={Spot} />
      <Route path="/comparison" component={Comparison} />
      <Route path="/forecast" component={Forecast} />
      <Route path="/profile" component={Profile} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/feedback" component={Feedback} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <PostRegistrationHandler />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
