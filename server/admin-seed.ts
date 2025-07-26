import { storage } from "./storage";

export async function seedAdminUser() {
  console.log("Seeding admin user...");
  
  try {
    // Check if there's already a super admin
    const existingAdmins = await storage.getUsersByRole('super_admin');
    if (existingAdmins.length > 0) {
      console.log("Super admin already exists, skipping admin seed");
      return;
    }

    // Create default admin user (you can change these details)
    const adminUser = {
      id: "admin-550e8400-e29b-41d4-a716-446655440000",
      email: "admin@vicsurf.com",
      displayName: "VicSurf Admin",
      firstName: "Admin",
      lastName: "User",
      role: "super_admin" as const,
      isActive: true,
      bio: "VicSurf platform administrator",
      surfingExperience: "expert" as const,
      location: "Victoria, Australia"
    };

    await storage.createUser(adminUser);
    console.log(`Admin user created successfully: ${adminUser.email}`);
    console.log("Default admin credentials:");
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    console.log("Note: This user will be able to access admin functions when authenticated via Replit Auth");
    
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}