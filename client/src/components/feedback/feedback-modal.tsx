import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Star, Plus, Bug, Lightbulb, MapPin, Settings } from "lucide-react";
import type { SurfSpot } from "@shared/schema";

interface FeedbackModalProps {
  trigger?: React.ReactNode;
  spotId?: number;
  spotName?: string;
  defaultType?: string;
}

export default function FeedbackModal({ trigger, spotId, spotName, defaultType = "general" }: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    feedbackType: defaultType,
    category: "",
    title: "",
    description: "",
    email: "",
    name: "",
    priority: "medium",
    spotId: spotId || null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  // Get surf spots for beach-specific feedback
  const { data: spots = [] } = useQuery<SurfSpot[]>({
    queryKey: ["/api/surf-spots"],
  });

  const feedbackTypes = [
    { value: "feature_request", label: "Feature Request", icon: Lightbulb },
    { value: "beach_suggestion", label: "Beach Suggestion", icon: MapPin },
    { value: "bug_report", label: "Bug Report", icon: Bug },
    { value: "general", label: "General Feedback", icon: MessageCircle },
  ];

  const categories = {
    feature_request: ["ui_ux", "forecasting", "notifications", "comparison", "other"],
    beach_suggestion: ["new_location", "missing_data", "incorrect_info", "camera_request", "other"],
    bug_report: ["functionality", "performance", "mobile", "data_accuracy", "other"],
    general: ["user_experience", "content", "pricing", "support", "other"]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        spotId: spotId || null,
        userId: user?.id || null,
      };

      const response = await apiRequest("POST", "/api/feedback", payload);
      
      if (response.ok) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback! We'll review it and get back to you.",
        });
        setIsOpen(false);
        setFormData({
          feedbackType: defaultType,
          category: "",
          title: "",
          description: "",
          email: "",
          name: "",
          priority: "medium"
        });
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = categories[formData.feedbackType as keyof typeof categories] || categories.general;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Feedback
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-ocean-blue" />
            <span>Send Feedback</span>
            {spotName && (
              <Badge variant="secondary" className="ml-2">
                {spotName}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    formData.feedbackType === type.value
                      ? "ring-2 ring-ocean-blue bg-ocean-blue/5"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setFormData({ ...formData, feedbackType: type.value, category: "" })}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className="h-6 w-6 mx-auto mb-2 text-ocean-blue" />
                    <p className="text-sm font-medium">{type.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of your feedback, suggestion, or issue"
              rows={4}
              required
            />
          </div>

          {/* Contact Info for Non-Logged-In Users */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Get updates on your feedback"
                />
              </div>
            </div>
          )}

          {/* Priority for Bug Reports */}
          {formData.feedbackType === "bug_report" && (
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Minor issue</SelectItem>
                  <SelectItem value="medium">Medium - Affects usability</SelectItem>
                  <SelectItem value="high">High - Major functionality issue</SelectItem>
                  <SelectItem value="critical">Critical - App unusable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Beach Selection for Beach Suggestions */}
          {formData.feedbackType === "beach_suggestion" && !spotId && (
            <div>
              <Label htmlFor="spot">Related Beach (Optional)</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, spotId: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a beach if applicable" />
                </SelectTrigger>
                <SelectContent>
                  {spots.map((spot) => (
                    <SelectItem key={spot.id} value={spot.id.toString()}>
                      {spot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-ocean-blue hover:bg-ocean-blue/90">
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}