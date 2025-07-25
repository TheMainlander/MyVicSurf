import { useState } from "react";
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Mail, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { SurfSpot, SurfCondition, Forecast } from "@shared/schema";

interface ShareButtonProps {
  spot: SurfSpot;
  conditions?: SurfCondition;
  forecast?: Forecast[];
  className?: string;
}

export default function ShareButton({ spot, conditions, forecast, className = "" }: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareText = () => {
    const baseText = `🏄‍♂️ Surf Report: ${spot.name}\n`;
    
    if (conditions) {
      const conditionsText = `
📊 Current Conditions:
• Wave Height: ${conditions.waveHeight}m
• Wind: ${conditions.windSpeed}km/h ${conditions.windDirection}
• Water Temp: ${conditions.waterTemperature}°C
• Rating: ${conditions.rating.toUpperCase()}

🌊 Perfect for ${spot.difficulty} surfers!
`;
      return baseText + conditionsText;
    }

    return baseText + `\n🌊 Check out the latest surf conditions at ${spot.name}!\n\n#VicSurf #SurfReport #${spot.name.replace(/\s+/g, '')}`;
  };

  const generateShareUrl = () => {
    return `${window.location.origin}/spots?id=${spot.id}`;
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${spot.name} Surf Report`,
          text: generateShareText(),
          url: generateShareUrl(),
        });
        setShowShareMenu(false);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast({
            title: "Share failed",
            description: "Unable to share. Please try copying the link instead.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      const shareText = generateShareText() + `\n🔗 ${generateShareUrl()}`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Surf report has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareMenu(false);
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareMenu(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`${spot.name} Surf Report`);
    const body = encodeURIComponent(generateShareText() + `\n\nView full report: ${generateShareUrl()}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowShareMenu(false);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateShareText() + `\n\n${generateShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if ('share' in navigator) {
            shareViaWebAPI();
          } else {
            setShowShareMenu(!showShareMenu);
          }
        }}
        className={`${className} hover:bg-ocean-blue/10 hover:text-ocean-blue border-ocean-blue/20`}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <Card className="absolute bottom-full right-0 mb-2 z-50 w-64 shadow-xl border-ocean-blue/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Share2 className="h-4 w-4 mr-2 text-ocean-blue" />
                Share Surf Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Native sharing options */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareOnTwitter}
                  className="justify-start"
                >
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareOnFacebook}
                  className="justify-start"
                >
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareViaWhatsApp}
                  className="justify-start"
                >
                  <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareViaEmail}
                  className="justify-start"
                >
                  <Mail className="h-4 w-4 mr-2 text-gray-600" />
                  Email
                </Button>
              </div>
              
              {/* Copy link */}
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="w-full justify-start"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}