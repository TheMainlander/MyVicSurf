import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, X, Star, MapPin, Bug, Lightbulb } from "lucide-react";
import type { SurfSpot } from "@shared/schema";

interface FeedbackFormProps {
  spotId?: number;
  spot?: SurfSpot;
  isOpen: boolean;
  onClose: () => void;
  feedbackType?: string;
}

interface FeedbackFormData {
  feedbackType: string;
  category: string;
  title: string;
  description: string;
  email?: string;
  name?: string;
  spotId?: number;
}

export default function FeedbackForm({ spotId, spot, isOpen, onClose, feedbackType = "general" }: FeedbackFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FeedbackFormData>({
    feedbackType,
    category: "",
    title: "",
    description: "",
    email: "",
    name: "",
    spotId
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await apiRequest('POST', '/api/feedback', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      if (spotId) {
        queryClient.invalidateQueries({ queryKey: [`/api/surf-spots/${spotId}/feedback`] });
      }
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it and get back to you.",
      });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      feedbackType: feedbackType,
      category: "",
      title: "",
      description: "",
      email: "",
      name: "",
      spotId
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in the title and description fields.",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const feedbackTypeOptions = [
    { value: "feature_request", label: "Feature Request", icon: Lightbulb, description: "Suggest a new feature" },
    { value: "beach_suggestion", label: "Beach Suggestion", icon: MapPin, description: "Suggest a new beach or spot" },
    { value: "bug_report", label: "Bug Report", icon: Bug, description: "Report a technical issue" },
    { value: "general", label: "General Feedback", icon: MessageSquare, description: "General comments or suggestions" }
  ];

  const categoryOptions = {
    feature_request: ["ui_ux", "forecasting", "notifications", "mobile_app", "other"],
    beach_suggestion: ["new_location", "location_details", "access_info", "conditions_data", "other"],
    bug_report: ["ui_ux", "performance", "data_accuracy", "login_issues", "other"],
    general: ["ui_ux", "content", "service", "support", "other"]
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-ocean-blue" />
              <CardTitle className="text-lg">Share Your Feedback</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {spot && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>About {spot.name}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Type */}
            <div className="space-y-2">
              <Label htmlFor="feedbackType">Feedback Type</Label>
              <Select
                value={formData.feedbackType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, feedbackType: value, category: "" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackTypeOptions.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            {formData.feedbackType && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions[formData.feedbackType as keyof typeof categoryOptions]?.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of your feedback"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about your feedback..."
                className="min-h-20 resize-none"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.description.length}/1000 characters
              </div>
            </div>

            {/* Contact Info for Anonymous Users */}
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Contact Information (Optional)</div>
              <div className="text-xs text-gray-600">
                We'll only use this to follow up on your feedback if needed.
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500">
                * Required fields
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitMutation.isPending || !formData.title.trim() || !formData.description.trim()}
                  className="bg-ocean-blue hover:bg-ocean-blue/90"
                >
                  {submitMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Submit Feedback</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}