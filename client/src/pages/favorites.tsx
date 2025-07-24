import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import FavoritesList from "@/components/favorites/favorites-list";

export default function Favorites() {
  // Mock user ID for development - in production this would come from authentication
  const currentUserId = "550e8400-e29b-41d4-a716-446655440000";
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pb-20">
        <section className="py-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <i className="fas fa-heart text-coral mr-2"></i>
              Your Favorites
            </h2>
            <p className="text-coastal-grey text-sm">
              Your saved surf spots for quick access
            </p>
          </div>

          <FavoritesList userId={currentUserId} showHeader={false} />
        </section>
      </main>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}