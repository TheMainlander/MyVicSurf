import { storage } from "./storage";

export async function seedCarouselImages() {
  console.log("Seeding carousel images...");
  
  try {
    const existingImages = await storage.getCarouselImages();
    if (existingImages.length > 0) {
      console.log("Carousel images already exist, skipping seed");
      return;
    }

    const carouselImages = [
      {
        name: "Bells Beach",
        description: "World-famous surf break home to the Rip Curl Pro",
        imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=500",
        location: "Torquay, Victoria",
        sortOrder: 1,
        isActive: true
      },
      {
        name: "Torquay Point",
        description: "Perfect for beginners with gentle, consistent waves",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=500",
        location: "Torquay, Victoria",
        sortOrder: 2,
        isActive: true
      },
      {
        name: "Jan Juc",
        description: "Consistent waves year-round with beautiful beach setting",
        imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=500",
        location: "Surf Coast, Victoria",
        sortOrder: 3,
        isActive: true
      },
      {
        name: "Winkipop",
        description: "Advanced surfers paradise with powerful reef break",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=500",
        location: "Torquay, Victoria",
        sortOrder: 4,
        isActive: true
      }
    ];

    for (const image of carouselImages) {
      await storage.createCarouselImage(image);
    }

    console.log(`Seeded ${carouselImages.length} carousel images successfully`);
  } catch (error) {
    console.error("Error seeding carousel images:", error);
  }
}