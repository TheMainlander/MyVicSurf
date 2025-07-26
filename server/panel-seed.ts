import { db } from "./db";
import { homePanels } from "@shared/schema";
import { eq } from "drizzle-orm";

const defaultPanels = [
  {
    panelKey: "current-conditions",
    title: "Current Conditions",
    description: "Real-time surf conditions and wave height",
    componentName: "CurrentConditions",
    panelType: "standard",
    requiredRole: null,
    isEnabled: true,
    sortOrder: 0,
    settings: {}
  },
  {
    panelKey: "premium-features",
    title: "Premium Features",
    description: "Advanced surf metrics and forecasting tools",
    componentName: "PremiumFeaturesPanel",
    panelType: "premium",
    requiredRole: null,
    isEnabled: true,
    sortOrder: 1,
    settings: {}
  },
  {
    panelKey: "beach-cameras",
    title: "Beach Cameras",
    description: "Live camera feeds from surf spots",
    componentName: "BeachCameras",
    panelType: "standard",
    requiredRole: null,
    isEnabled: true,
    sortOrder: 2,
    settings: {}
  },
  {
    panelKey: "tide-information",
    title: "Tide Information",
    description: "Current and upcoming tide charts",
    componentName: "TideInformation",
    panelType: "standard",
    requiredRole: null,
    isEnabled: true,
    sortOrder: 3,
    settings: {}
  },
  {
    panelKey: "forecast-timeline",
    title: "Forecast Timeline",
    description: "7-day surf forecast",
    componentName: "ForecastTimeline",
    panelType: "standard",
    requiredRole: null,
    isEnabled: true,
    sortOrder: 4,
    settings: {}
  },
  {
    panelKey: "feedback-form",
    title: "Feedback Form",
    description: "User feedback and suggestions",
    componentName: "SimpleFeedbackForm",
    panelType: "conditional",
    requiredRole: "user",
    isEnabled: true,
    sortOrder: 5,
    settings: {}
  }
];

async function seedHomePanels() {
  console.log("Seeding home panels...");
  
  try {
    // Check if panels already exist
    const existingPanels = await db.select().from(homePanels).limit(1);
    
    if (existingPanels.length > 0) {
      console.log("Home panels already exist, skipping seed");
      return;
    }

    // Insert default panels
    for (const panel of defaultPanels) {
      await db.insert(homePanels).values({
        ...panel,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log(`Successfully seeded ${defaultPanels.length} home panels`);
  } catch (error) {
    console.error("Error seeding home panels:", error);
  }
}

// Run if called directly (ES modules compatibility)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedHomePanels().then(() => {
    console.log("Panel seeding completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Panel seeding failed:", error);
    process.exit(1);
  });
}

export { seedHomePanels };