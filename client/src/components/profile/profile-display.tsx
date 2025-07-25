import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, MapPin, Calendar, Phone, Instagram, Globe, Mail } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface ProfileDisplayProps {
  user: UserType;
  onEdit: () => void;
}

export default function ProfileDisplay({ user, onEdit }: ProfileDisplayProps) {
  const getExperienceBadgeColor = (experience: string | null) => {
    switch (experience) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-blue-100 text-blue-800 border-blue-200";
      case "advanced": return "bg-purple-100 text-purple-800 border-purple-200";
      case "expert": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const displayName = user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Surfer";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 text-ocean-blue mr-2" />
            Profile Information
          </CardTitle>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Avatar className="mx-auto w-20 h-20">
          <AvatarImage src={user.profileImageUrl || undefined} alt={user.displayName || user.firstName || "User"} />
          <AvatarFallback className="bg-ocean-blue text-white text-xl">
            {user.displayName?.[0] || user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold text-gray-900">{displayName}</h3>
        {user.email && (
          <div className="flex items-center justify-center mt-2 text-coastal-grey">
            <Mail className="h-4 w-4 mr-1" />
            <span className="text-sm">{user.email}</span>
          </div>
        )}
      </CardContent>
      <CardContent className="space-y-6">
        {/* Profile Avatar and Name */}
        {/* Basic Information */}
        <div className="space-y-4">
          {(user.firstName || user.lastName) && (
            <div>
              <Label>Full Name</Label>
              <Value>{`${user.firstName || ""} ${user.lastName || ""}`.trim() || "Not set"}</Value>
            </div>
          )}

          {user.location && (
            <div>
              <Label>Location</Label>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-coastal-grey mr-2" />
                <Value>{user.location}</Value>
              </div>
            </div>
          )}

          {user.surfingExperience && (
            <div>
              <Label>Surfing Experience</Label>
              <div>
                <Badge className={`${getExperienceBadgeColor(user.surfingExperience)} capitalize`}>
                  {user.surfingExperience}
                </Badge>
              </div>
            </div>
          )}

          {user.bio && (
            <div>
              <Label>Bio</Label>
              <Value className="leading-relaxed">{user.bio}</Value>
            </div>
          )}

          {user.phoneNumber && (
            <div>
              <Label>Phone Number</Label>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-coastal-grey mr-2" />
                <Value>{user.phoneNumber}</Value>
              </div>
            </div>
          )}

          {user.instagramHandle && (
            <div>
              <Label>Instagram</Label>
              <div className="flex items-center">
                <Instagram className="h-4 w-4 text-coastal-grey mr-2" />
                <Value>
                  {user.instagramHandle.startsWith('@') ? user.instagramHandle : `@${user.instagramHandle}`}
                </Value>
              </div>
            </div>
          )}

          <div>
            <Label>Member Since</Label>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-coastal-grey mr-2" />
              <Value>{formatDate(user.createdAt)}</Value>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-coastal-grey">{children}</span>;
}

function Value({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-gray-900 ${className}`}>{children}</p>;
}