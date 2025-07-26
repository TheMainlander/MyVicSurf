// Quick fix for beach schema migration
import { db } from "./db";

async function fixBeachSchema() {
  try {
    // Add missing columns to surf_spots table if they don't exist
    await db.execute(`
      ALTER TABLE surf_spots 
      ADD COLUMN IF NOT EXISTS beach_type TEXT DEFAULT 'both',
      ADD COLUMN IF NOT EXISTS beach_category TEXT DEFAULT 'surf_beach',
      ADD COLUMN IF NOT EXISTS facilities TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS access_info TEXT,
      ADD COLUMN IF NOT EXISTS best_conditions TEXT,
      ADD COLUMN IF NOT EXISTS hazards TEXT[] DEFAULT '{}'
    `);
    
    console.log("Beach schema updated successfully!");
  } catch (error) {
    console.error("Error updating beach schema:", error);
  }
}

if (require.main === module) {
  fixBeachSchema();
}