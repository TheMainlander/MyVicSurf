import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, Bug, Lightbulb, MapPin } from "lucide-react";
import FeedbackForm from "./feedback-form";
import type { SurfSpot } from "@shared/schema";

interface FeedbackButtonProps {
  variant?: "default" | "outline" | "ghost" | "floating";
  size?: "sm" | "md" | "lg";
  spotId?: number;
  spot?: SurfSpot;
  feedbackType?: "feature_request" | "beach_suggestion" | "bug_report" | "general";
  className?: string;
  children?: React.ReactNode;
}

export default function FeedbackButton({ 
  variant = "default", 
  size = "md",
  spotId,
  spot,
  feedbackType = "general",
  className = "",
  children
}: FeedbackButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getIcon = () => {
    switch (feedbackType) {
      case "feature_request":
        return <Lightbulb className="h-4 w-4" />;
      case "beach_suggestion":
        return <MapPin className="h-4 w-4" />;
      case "bug_report":
        return <Bug className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (children) return children;
    
    switch (feedbackType) {
      case "feature_request":
        return "Suggest Feature";
      case "beach_suggestion":
        return "Suggest Beach";
      case "bug_report":
        return "Report Issue";
      default:
        return "Give Feedback";
    }
  };

  const getButtonVariant = () => {
    if (variant === "floating") {
      return "default";
    }
    return variant;
  };

  const getButtonClass = () => {
    let baseClass = "";
    
    if (variant === "floating") {
      baseClass = "fixed bottom-20 right-4 z-40 shadow-lg bg-ocean-blue hover:bg-ocean-blue/90 text-white";
    } else {
      baseClass = feedbackType === "bug_report" 
        ? "bg-red-600 hover:bg-red-700 text-white"
        : feedbackType === "feature_request"
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-ocean-blue hover:bg-ocean-blue/90 text-white";
    }
    
    return `${baseClass} ${className}`;
  };

  return (
    <>
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={() => setIsFormOpen(true)}
        className={getButtonClass()}
      >
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span>{getButtonText()}</span>
        </div>
      </Button>

      <FeedbackForm
        spotId={spotId}
        spot={spot}
        feedbackType={feedbackType}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}