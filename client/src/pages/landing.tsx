import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      ></div>
      
      {/* Gradient Overlay - 10% opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-blue-700/90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Ocean wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-800/30 to-transparent">
          <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" 
                  fill="rgba(255,255,255,0.05)" className="animate-pulse">
            </path>
          </svg>
        </div>
      </div>
      
      <div className="relative z-10">
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl wave-animation">🏄‍♀️</div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">VicSurf</h1>
              </div>
              
              <Button
                onClick={handleLogin}
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 hover:scale-105 transition-all duration-200 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </header>
      
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12 fade-in">
            <div className="wave-animation">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
                🏄‍♀️ VicSurf
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white mb-8 slide-up drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
              Your Ultimate Guide to Victoria's Surf Conditions
            </p>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto slide-up drop-shadow-md" style={{ animationDelay: '0.4s' }}>
              Get real-time surf reports, forecasts, and tide information for Victoria's premier surf spots. 
              Track conditions at Bells Beach, Torquay Point, Jan Juc, and Winki Pop.
            </p>
            
            {/* Enhanced Registration Section */}
            <div className="slide-up space-y-6 max-w-md mx-auto" style={{ animationDelay: '0.6s' }}>
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2 text-center">Start Your Surf Journey</h3>
                <p className="text-cyan-300 text-sm font-medium mb-4 text-center">
                  Join 1,000+ surfers tracking perfect waves
                </p>
                <p className="text-white/80 text-sm mb-6 text-center">
                  Get instant alerts when your favorite spots hit optimal conditions, track forecasts 7 days ahead, and never miss epic surf again
                </p>
                
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:scale-[1.02] transition-all duration-200 font-bold py-4 text-base shadow-xl rounded-xl flex items-center justify-center gap-3 border-2 border-transparent hover:border-white/20"
                >
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm">
                    <div className="text-white text-sm font-bold">R</div>
                  </div>
                  Register Free with Replit
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-white/60 text-xs">
                    Free forever • No credit card required • 30-second setup
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-6 text-white/80 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-cyan-400">✓</span>
                    <span>Real-time alerts</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-cyan-400">✓</span>
                    <span>7-day forecasts</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-cyan-400">✓</span>
                    <span>Favorite spots</span>
                  </div>
                </div>
                <p className="text-white/60 text-xs">
                  Already have an account? You'll be signed in automatically
                </p>
              </div>
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
    </div>
  );
}