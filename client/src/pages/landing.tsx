import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-blue via-wave-foam to-sandy-beige">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12 fade-in">
            <div className="wave-animation">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                🏄‍♂️ VicSurf
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 mb-8 slide-up" style={{ animationDelay: '0.2s' }}>
              Your Ultimate Guide to Victoria's Surf Conditions
            </p>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto slide-up" style={{ animationDelay: '0.4s' }}>
              Get real-time surf reports, forecasts, and tide information for Victoria's premier surf spots. 
              Track conditions at Bells Beach, Torquay Point, Jan Juc, and Winki Pop.
            </p>
            
            <div className="slide-up" style={{ animationDelay: '0.6s' }}>
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200 font-semibold px-8 py-3 text-lg shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="glass hover:scale-105 transition-all duration-300 slide-up" style={{ animationDelay: '0.8s' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center">
                  <div className="text-2xl mr-3">🌊</div>
                  Real-Time Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Live wave heights, wind conditions, and water temperature from trusted sources
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:scale-105 transition-all duration-300 slide-up" style={{ animationDelay: '1.0s' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center">
                  <div className="text-2xl mr-3">📈</div>
                  7-Day Forecasts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Plan your surf sessions with detailed forecasts and optimal condition alerts
                </p>
              </CardContent>
            </Card>

            <Card className="glass hover:scale-105 transition-all duration-300 slide-up" style={{ animationDelay: '1.2s' }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center">
                  <div className="text-2xl mr-3">❤️</div>
                  Personal Favorites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80">
                  Save your favorite spots and get push notifications for optimal conditions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Surf Spots Preview */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Featured Surf Spots</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: "Bells Beach", description: "World-famous surf break" },
                { name: "Torquay Point", description: "Perfect for beginners" },
                { name: "Jan Juc", description: "Consistent waves" },
                { name: "Winki Pop", description: "Advanced surfers" },
              ].map((spot) => (
                <Card key={spot.name} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">{spot.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm">{spot.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Catch the Perfect Wave?
            </h3>
            <p className="text-white/80 mb-6">
              Join VicSurf today and never miss optimal surf conditions again
            </p>
            <Button
              onClick={handleLogin}
              size="lg"
              className="bg-sunset-orange text-white hover:bg-sunset-orange/90 font-semibold px-8 py-3"
            >
              Sign In to Continue
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}