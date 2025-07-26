import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Bug, Lightbulb, MapPin, X } from "lucide-react";
import FeedbackModal from "./feedback-modal";

interface FeedbackFabProps {
  spotId?: number;
  spotName?: string;
}

export default function FeedbackFab({ spotId, spotName }: FeedbackFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const feedbackOptions = [
    { type: "feature_request", icon: Lightbulb, label: "Feature Idea", color: "bg-yellow-500 hover:bg-yellow-600" },
    { type: "beach_suggestion", icon: MapPin, label: "Beach Info", color: "bg-green-500 hover:bg-green-600" },
    { type: "bug_report", icon: Bug, label: "Report Bug", color: "bg-red-500 hover:bg-red-600" },
    { type: "general", icon: MessageCircle, label: "General", color: "bg-blue-500 hover:bg-blue-600" },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end space-y-2">
      {/* Expanded Options */}
      {isExpanded && (
        <div className="flex flex-col space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {feedbackOptions.map((option) => {
            const Icon = option.icon;
            return (
              <FeedbackModal
                key={option.type}
                spotId={spotId}
                spotName={spotName}
                defaultType={option.type}
                trigger={
                  <Button
                    size="sm"
                    className={`${option.color} text-white shadow-lg flex items-center space-x-2 px-3 py-2`}
                    onClick={() => setIsExpanded(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{option.label}</span>
                  </Button>
                }
              />
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        size="sm"
        className={`shadow-lg transition-all duration-200 ${
          isExpanded 
            ? "bg-gray-500 hover:bg-gray-600 rotate-45" 
            : "bg-ocean-blue hover:bg-ocean-blue/90"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <X className="h-5 w-5" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}