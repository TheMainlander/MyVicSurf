import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ThumbsUp, MessageCircle, Bug, Lightbulb, MapPin, Settings, Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Feedback {
  id: number;
  userId?: string;
  name?: string;
  feedbackType: string;
  category?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  upvotes: number;
  spotId?: number;
  spotName?: string;
  adminResponse?: string;
  isPublic: boolean;
  createdAt: string;
  hasVoted?: boolean;
}

interface FeedbackListProps {
  showAll?: boolean;
  feedbackType?: string;
  spotId?: number;
  userId?: string;
}

export default function FeedbackList({ showAll = false, feedbackType, spotId, userId }: FeedbackListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState(feedbackType || "all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch feedback
  const { data: feedbackList = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback", { showAll, feedbackType: typeFilter, spotId, userId, status: statusFilter, search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (showAll) params.append("showAll", "true");
      if (typeFilter && typeFilter !== "all") params.append("feedbackType", typeFilter);
      if (spotId) params.append("spotId", spotId.toString());
      if (userId) params.append("userId", userId);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await apiRequest("GET", `/api/feedback?${params.toString()}`);
      return await response.json();
    },
  });

  // Check if user is logged in
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async (feedbackId: number) => {
      return await apiRequest("POST", `/api/feedback/${feedbackId}/vote`, { voteType: "upvote" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      toast({
        title: "Vote Recorded",
        description: "Thank you for your vote!",
      });
    },
    onError: () => {
      toast({
        title: "Vote Failed",
        description: "Please try again or sign in to vote.",
        variant: "destructive",
      });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature_request": return <Lightbulb className="h-4 w-4" />;
      case "beach_suggestion": return <MapPin className="h-4 w-4" />;
      case "bug_report": return <Bug className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-800";
      case "reviewing": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const filteredFeedback = feedbackList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-ocean-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {!feedbackType && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="feature_request">Feature Requests</SelectItem>
              <SelectItem value="beach_suggestion">Beach Suggestions</SelectItem>
              <SelectItem value="bug_report">Bug Reports</SelectItem>
              <SelectItem value="general">General Feedback</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No feedback found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? "Try adjusting your search terms" : "Be the first to share your thoughts!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(feedback.feedbackType)}
                      <CardTitle className="text-base">{feedback.title}</CardTitle>
                      {feedback.spotName && (
                        <Badge variant="outline" className="text-xs">
                          {feedback.spotName}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(feedback.status)}>
                        {feedback.status.replace("_", " ")}
                      </Badge>
                      
                      {feedback.priority !== "medium" && (
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(feedback.priority)}`} />
                          <span className="text-xs text-gray-600 capitalize">{feedback.priority}</span>
                        </div>
                      )}
                      
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                      </span>
                      
                      {feedback.name && (
                        <span className="text-xs text-gray-500">by {feedback.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Upvote Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => upvoteMutation.mutate(feedback.id)}
                    disabled={!user || feedback.hasVoted || upvoteMutation.isPending}
                    className={`flex items-center space-x-1 ${feedback.hasVoted ? "text-ocean-blue" : ""}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${feedback.hasVoted ? "fill-current" : ""}`} />
                    <span className="text-sm">{feedback.upvotes}</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-gray-700 text-sm mb-3">{feedback.description}</p>
                
                {feedback.adminResponse && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Admin Response</span>
                    </div>
                    <p className="text-sm text-blue-700">{feedback.adminResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}