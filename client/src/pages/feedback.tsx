import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Star, Bug, Lightbulb, MapPin, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Link } from "wouter";

export default function Feedback() {
  const [formData, setFormData] = useState({
    feedbackType: "general",
    title: "",
    description: "",
    email: "",
    name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        userId: user?.id || null,
        priority: "medium",
        category: null
      };

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback! We'll review it and get back to you.",
        });
        setFormData({
          feedbackType: "general",
          title: "",
          description: "",
          email: "",
          name: ""
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

  const feedbackTypes = [
    { value: "feature_request", label: "Feature Request", icon: Lightbulb },
    { value: "beach_suggestion", label: "Beach Suggestion", icon: MapPin },
    { value: "bug_report", label: "Bug Report", icon: Bug },
    { value: "general", label: "General Feedback", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center bg-ocean-blue text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center space-x-2 text-xl">
              <MessageCircle className="h-6 w-6" />
              <span>Send Us Your Feedback</span>
            </CardTitle>
            <p className="text-blue-100 text-sm">
              Help us improve VicSurf by sharing your thoughts, suggestions, or reporting issues
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feedback Type */}
              <div>
                <Label htmlFor="feedbackType" className="text-sm font-medium text-gray-700">
                  Feedback Type
                </Label>
                <Select value={formData.feedbackType} onValueChange={(value) => setFormData({ ...formData, feedbackType: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Subject *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of your feedback"
                  className="mt-1"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Message *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us more about your feedback, suggestion, or issue..."
                  rows={4}
                  className="mt-1"
                  required
                />
              </div>

              {/* Contact Info for Non-Logged-In Users */}
              {!user && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm text-gray-600">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm text-gray-600">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Provide your email if you'd like us to follow up with you
                  </p>
                </div>
              )}

              {user && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p>Signed in as <span className="font-medium">{user.email}</span></p>
                  <p className="text-xs mt-1">We'll follow up with you at this email if needed</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-ocean-blue hover:bg-ocean-blue/90"
                >
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Help Section */}
        <Card className="mt-6 border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-800 mb-2">Common Questions</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Bug reports:</strong> Include steps to reproduce the issue</li>
              <li>• <strong>Feature requests:</strong> Describe how it would help your surf planning</li>
              <li>• <strong>Beach suggestions:</strong> Let us know which Victorian beaches to add</li>
              <li>• <strong>General feedback:</strong> Any thoughts to help us improve VicSurf</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      
      <BottomNavigation activeTab="home" />
    </div>
  );
}