import { storage } from "./storage";

export async function seedSubscriptionPlans() {
  console.log("Seeding subscription plans...");
  
  try {
    // Check if plans already exist
    const existingPlans = await storage.getSubscriptionPlans();
    if (existingPlans.length > 0) {
      console.log("Subscription plans already exist, skipping seed");
      return;
    }

    // Create Free Plan
    await storage.createSubscriptionPlan({
      name: "free",
      displayName: "Free Surfer",
      description: "Basic surf conditions and forecasts for casual surfers",
      price: 0,
      currency: "aud",
      interval: "month",
      features: [
        "Basic 3-day forecast",
        "Current surf conditions",
        "Essential tide times",
        "Weather information",
        "Mobile-friendly interface"
      ],
      isActive: true
    });

    // Create Premium Plan
    await storage.createSubscriptionPlan({
      name: "premium",
      displayName: "Wave Rider",
      description: "Enhanced forecasting and alerts for serious surfers",
      price: 999, // $9.99 AUD per month
      currency: "aud", 
      interval: "month",
      stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
      features: [
        "Extended 7-day detailed forecast",
        "Real-time surf alerts",
        "Premium camera access",
        "Wind and swell analysis",
        "Tide prediction accuracy",
        "Favorite spots with notifications",
        "Surf session tracking",
        "Mobile app priority support"
      ],
      isActive: true
    });

    // Create Pro Plan
    await storage.createSubscriptionPlan({
      name: "pro",
      displayName: "Surf Master",
      description: "Professional-grade tools for surf coaches and enthusiasts",
      price: 1999, // $19.99 AUD per month
      currency: "aud",
      interval: "month", 
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
      features: [
        "14-day advanced forecasting",
        "Multi-spot monitoring dashboard",
        "API access for integration",
        "Advanced weather analytics",
        "Swell modeling and predictions",
        "Surf coaching tools",
        "Export data and reports",
        "Priority customer support",
        "Early access to new features",
        "Unlimited session tracking"
      ],
      isActive: true
    });

    console.log("✅ Subscription plans seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding subscription plans:", error);
  }
}