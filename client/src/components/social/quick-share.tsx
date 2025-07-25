import { Facebook, Twitter, MessageCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { SurfSpot, SurfCondition } from "@shared/schema";

interface QuickShareProps {
  spot: SurfSpot;
  conditions?: SurfCondition;
  compact?: boolean;
}

export default function QuickShare({ spot, conditions, compact = false }: QuickShareProps) {
  const { toast } = useToast();

  const generateShareText = () => {
    if (conditions) {
      return `🏄‍♂️ ${spot.name}: ${conditions.waveHeight}m waves, ${conditions.rating} conditions! 
🌊 Wind: ${conditions.windSpeed}km/h ${conditions.windDirection}
🌡️ Water: ${conditions.waterTemperature}°C
#VicSurf #SurfReport`;
    }
    return `🏄‍♂️ Check out ${spot.name} surf conditions! #VicSurf #SurfReport`;
  };

  const generateShareUrl = () => {
    return `${window.location.origin}/spots?highlight=${spot.id}`;
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateShareText() + `\n\n${generateShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyShareLink = async () => {
    try {
      const shareText = generateShareText() + `\n\n${generateShareUrl()}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied!",
        description: "Surf report copied to clipboard.",
      });
    } catch (error) {
      console.error('Error copying:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (compact) {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={shareOnTwitter}
          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
        >
          <Twitter className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={shareOnFacebook}
          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
        >
          <Facebook className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={shareViaWhatsApp}
          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyShareLink}
          className="h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-600"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={shareOnTwitter}
        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Twitter className="h-4 w-4 mr-2" />
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareOnFacebook}
        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Facebook className="h-4 w-4 mr-2" />
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareViaWhatsApp}
        className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>
    </div>
  );
}