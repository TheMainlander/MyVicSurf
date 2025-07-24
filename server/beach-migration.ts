// Beach Data Migration Script
// This script updates existing surf spots with new beach type data from Wikipedia

import { db } from "./db";
import { surfSpots } from "@shared/schema";
import { victorianBeachesData } from "./victorian-beaches-data";
import { eq } from "drizzle-orm";

export async function migrateBeachData() {
  console.log("Starting beach data migration...");
  
  try {
    // Update existing spots with new beach type information
    for (const beachData of victorianBeachesData) {
      const existingSpot = await db
        .select()
        .from(surfSpots)
        .where(eq(surfSpots.name, beachData.name))
        .limit(1);
      
      if (existingSpot.length > 0) {
        // Update existing spot
        await db
          .update(surfSpots)
          .set({
            description: beachData.description,
            imageUrl: beachData.imageUrl,
            beachType: beachData.beachType,
            beachCategory: beachData.beachCategory,
            facilities: beachData.facilities,
            accessInfo: beachData.accessInfo,
            bestConditions: beachData.bestConditions,
            hazards: beachData.hazards
          })
          .where(eq(surfSpots.name, beachData.name));
        
        console.log(`Updated ${beachData.name}`);
      } else {
        // Insert new spot
        await db.insert(surfSpots).values({
          name: beachData.name,
          latitude: beachData.latitude,
          longitude: beachData.longitude,
          description: beachData.description,
          imageUrl: beachData.imageUrl,
          region: beachData.region,
          difficulty: beachData.difficulty,
          beachType: beachData.beachType,
          beachCategory: beachData.beachCategory,
          facilities: beachData.facilities,
          accessInfo: beachData.accessInfo,
          bestConditions: beachData.bestConditions,
          hazards: beachData.hazards,
          externalId: beachData.externalId,
          apiSource: beachData.apiSource
        });
        
        console.log(`Inserted ${beachData.name}`);
      }
    }
    
    console.log("Beach data migration completed successfully!");
  } catch (error) {
    console.error("Error during beach data migration:", error);
    throw error;
  }
}