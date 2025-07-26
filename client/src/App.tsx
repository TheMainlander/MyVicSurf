import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Spots from "@/pages/spots";
import Forecast from "@/pages/forecast";
import Profile from "@/pages/profile";
import Favorites from "@/pages/favorites";
import Landing from "@/pages/landing";
import Pricing from "@/pages/pricing";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import AdminPage from "@/pages/admin";
import AdminUsersPage from "@/pages/admin-users";
import PostRegistrationHandler from "@/components/registration/post-registration-handler";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          {/* Admin routes accessible for authentication redirect */}
          <Route path="/admin" component={AdminPage} />
          <Route path="/admin/users" component={AdminUsersPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/spots" component={Spots} />
          <Route path="/forecast" component={Forecast} />
          <Route path="/profile" component={Profile} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/admin/users" component={AdminUsersPage} />
        </>
      )}
      {/* Payment routes - accessible to all users */}
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/:planId" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
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
