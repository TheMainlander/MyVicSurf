import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import RegistrationFlow from "@/components/registration/registration-flow";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CarouselImage } from "@shared/schema";

export default function Landing() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleRegister = () => {
    setShowRegistration(true);
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Fetch carousel images from database
  const { data: carouselImages = [], isLoading: isLoadingImages } = useQuery({
    queryKey: ['/api/carousel-images'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/carousel-images');
      return await response.json() as CarouselImage[];
    }
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - Dynamic Surf Action */}
      <div 
        className="absolute inset-0 bg-cover bg-right bg-no-repeat"
        style={{
          backgroundImage: `url('@assets/234969-825-auto_1753425546732.webp')`,
          backgroundPosition: 'right center'
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
      
        <main className="container mx-auto px-4 py-8">
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
              Track conditions at Bells Beach, Torquay Point, Jan Juc, and Winkipop.
            </p>
            
            {/* Enhanced Registration Section */}
            <div className="slide-up space-y-6 max-w-md mx-auto" style={{ animationDelay: '0.6s' }}>
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2 text-center">Start Your Surf Journey</h3>
                <p className="text-cyan-300 text-sm font-medium mb-6 text-center">
                  Join 1,000+ surfers tracking perfect waves
                </p>
                
                <Button
                  onClick={handleRegister}
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:scale-[1.02] transition-all duration-200 font-bold py-4 text-base shadow-xl rounded-xl flex items-center justify-center border-2 border-transparent hover:border-white/20"
                >
                  Get Started
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
          </div>



          {/* Surf Spots Carousel */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 drop-shadow-lg text-center">Featured Surf Spots</h2>
            
            <div className="relative max-w-6xl mx-auto">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
                <div className="flex">
                  {carouselImages.map((spot, index) => (
                    <div key={spot.id} className="flex-[0_0_100%] min-w-0 relative">
                      <div className="relative h-[500px] mx-4">
                        {/* Background Image */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                          <img
                            src={spot.imageUrl}
                            alt={`${spot.name} surf beach`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl"></div>
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                          <div className="mb-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                              <div className="text-2xl">🏄‍♀️</div>
                            </div>
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{spot.name}</h3>
                          <p className="text-white/90 text-lg mb-2 drop-shadow-md">{spot.description}</p>
                          <p className="text-cyan-300 text-sm font-medium drop-shadow-sm">{spot.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>


            </div>
            {/* Features Grid - Below Surf Spots */}
            <div className="grid md:grid-cols-3 gap-8 mb-16 mt-16">
              <div className="glass rounded-2xl p-10 hover:scale-105 transition-all duration-300 slide-up text-center" style={{ animationDelay: '1.8s' }}>
                <div className="text-4xl mb-6">🌊</div>
                <h3 className="text-2xl font-bold text-white mb-6">Real-Time Conditions</h3>
                <p className="text-white/80 leading-relaxed">
                  Live wave heights, wind conditions, and water temperature from trusted sources
                </p>
              </div>

              <div className="glass rounded-2xl p-10 hover:scale-105 transition-all duration-300 slide-up text-center" style={{ animationDelay: '2.0s' }}>
                <div className="text-4xl mb-6">📈</div>
                <h3 className="text-2xl font-bold text-white mb-6">7-Day Forecasts</h3>
                <p className="text-white/80 leading-relaxed">
                  Plan your surf sessions with detailed forecasts and optimal condition alerts
                </p>
              </div>

              <div className="glass rounded-2xl p-10 hover:scale-105 transition-all duration-300 slide-up text-center" style={{ animationDelay: '2.2s' }}>
                <div className="text-4xl mb-6">❤️</div>
                <h3 className="text-2xl font-bold text-white mb-6">Personal Favorites</h3>
                <p className="text-white/80 leading-relaxed">
                  Save your favorite spots and get push notifications for optimal conditions
                </p>
              </div>
            </div>

          {/* Call to Action */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 mt-8">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">
              Ready to Catch the Perfect Wave?
            </h3>
            <p className="text-white/80 mb-8 text-center text-lg max-w-2xl mx-auto">
              Join VicSurf today and never miss optimal surf conditions again
            </p>
            <div className="text-center">
              <Button
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 font-bold px-12 py-4 text-lg rounded-xl shadow-xl"
              >
                Sign In to Continue
              </Button>
            </div>
          </div>

          {/* Footer with Social Share Icons */}
          <footer className="mt-16 pt-8 border-t border-white/20">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Share VicSurf</h3>
              <div className="flex justify-center space-x-6">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out VicSurf - Your Ultimate Guide to Victoria\'s Surf Conditions!')}&url=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
                  aria-label="Share on X (Twitter)"
                >
                  <FaXTwitter className="w-5 h-5" />
                </a>
                
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
                  aria-label="Share on Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
                
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Check out VicSurf - Your Ultimate Guide to Victoria\'s Surf Conditions! ' + window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </a>
              </div>
              
              <p className="text-white/60 text-sm mt-4">
                Share the stoke with fellow surfers
              </p>
              
              {/* Replit Attribution */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <a 
                  href="https://replit.com/refer/Producto-Builds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-white/80 text-sm">Proudly Built by a Human and my</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" fill="#F26207"/>
                      <path d="M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" fill="white"/>
                    </svg>
                    <span className="text-white font-medium text-sm">Replit AI</span>
                  </div>
                </a>
              </div>
            </div>
          </footer>
          </div>
        </main>
      </div>

      {/* Registration Flow Modal */}
      {showRegistration && (
        <RegistrationFlow onClose={() => setShowRegistration(false)} />
      )}
    </div>
  );
}