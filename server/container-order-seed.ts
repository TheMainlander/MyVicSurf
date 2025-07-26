import { db } from "./db";
import { containerOrder } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEFAULT_CONTAINERS = [
  {
    containerId: 'beach-management',
    title: 'Beach Management',
    description: 'Manage Victoria beaches & surf spots',
    icon: 'MapPin',
    sortOrder: 1,
    isActive: true
  },
  {
    containerId: 'carousel-management',
    title: 'Carousel Management',
    description: 'Manage landing page images',
    icon: 'ImageIcon',
    sortOrder: 2,
    isActive: true
  },
  {
    containerId: 'user-management',
    title: 'User Management',
    description: 'Manage user accounts',
    icon: 'Users',
    sortOrder: 3,
    isActive: true
  },
  {
    containerId: 'sales-marketing',
    title: 'Sales & Marketing',
    description: 'Marketing documents and campaigns',
    icon: 'TrendingUp',
    sortOrder: 4,
    isActive: true
  },
  {
    containerId: 'system-documents',
    title: 'System Documents',
    description: 'PRDs, specifications, and technical docs',
    icon: 'FileText',
    sortOrder: 5,
    isActive: true
  },
  {
    containerId: 'documentation',
    title: 'Full Documentation',
    description: 'Complete admin guide',
    icon: 'HelpCircle',
    sortOrder: 6,
    isActive: true
  }
];

export async function seedContainerOrder() {
  console.log("Seeding container order...");
  
  try {
    // Check if containers already exist
    const existingContainers = await db.select().from(containerOrder).limit(1);
    
    if (existingContainers.length > 0) {
      console.log("Container order already exists, skipping seed");
      return;
    }

    // Insert default container order
    await db.insert(containerOrder).values(DEFAULT_CONTAINERS);
    
    console.log("✅ Container order seeded successfully");
  } catch (error) {
    console.error("Failed to seed container order:", error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedContainerOrder();
}