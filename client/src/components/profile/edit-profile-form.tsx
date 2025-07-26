import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Edit, Save, X, Camera, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

const profileSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  surfingExperience: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  phoneNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
  twitterHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  profileImageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  user: UserType;
  onCancel: () => void;
}

export default function EditProfileForm({ user, onCancel }: EditProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(user.profileImageUrl || null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      location: user.location || "",
      bio: user.bio || "",
      surfingExperience: (user.surfingExperience as "beginner" | "intermediate" | "advanced" | "expert") || "intermediate",
      phoneNumber: user.phoneNumber || "",
      instagramHandle: user.instagramHandle || "",
      twitterHandle: user.twitterHandle || "",
      facebookHandle: user.facebookHandle || "",
      profileImageUrl: user.profileImageUrl || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("PATCH", `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      onCancel();
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For demo purposes, we'll create a data URL
      // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewImage(dataUrl);
        form.setValue("profileImageUrl", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setPreviewImage(url);
    form.setValue("profileImageUrl", url);
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Edit className="h-5 w-5 text-ocean-blue mr-2" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={previewImage || undefined} alt="Profile preview" />
              <AvatarFallback className="bg-ocean-blue text-white text-xl">
                {form.watch("displayName")?.[0] || form.watch("firstName")?.[0] || user.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewImage(null);
                  form.setValue("profileImageUrl", "");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <Label htmlFor="profileImageUrl">Profile Image URL (Optional)</Label>
            <Input
              id="profileImageUrl"
              {...form.register("profileImageUrl")}
              placeholder="https://example.com/your-image.jpg"
              onChange={(e) => handleImageUrlChange(e.target.value)}
            />
            {form.formState.errors.profileImageUrl && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.profileImageUrl.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="your.email@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Your first name"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Your last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              {...form.register("displayName")}
              placeholder="How you want to be known"
            />
            {form.formState.errors.displayName && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder="Melbourne, Victoria"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="surfingExperience">Surfing Experience</Label>
            <Select 
              value={form.watch("surfingExperience")} 
              onValueChange={(value) => form.setValue("surfingExperience", value as "beginner" | "intermediate" | "advanced" | "expert")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.surfingExperience && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.surfingExperience.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder="Tell us about yourself and your surfing journey..."
              rows={3}
              className="resize-none"
            />
            <div className="text-sm text-coastal-grey mt-1">
              {form.watch("bio")?.length || 0}/500
            </div>
            {form.formState.errors.bio && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              {...form.register("phoneNumber")}
              placeholder="+61 4XX XXX XXX"
            />
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              My Socials
            </h3>
            
            <div>
              <Label htmlFor="instagramHandle">Instagram Handle</Label>
              <Input
                id="instagramHandle"
                {...form.register("instagramHandle")}
                placeholder="@yourusername"
              />
              {form.formState.errors.instagramHandle && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.instagramHandle.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="twitterHandle">Twitter/X Handle</Label>
              <Input
                id="twitterHandle"
                {...form.register("twitterHandle")}
                placeholder="@yourusername"
              />
              {form.formState.errors.twitterHandle && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.twitterHandle.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="facebookHandle">Facebook Profile</Label>
              <Input
                id="facebookHandle"
                {...form.register("facebookHandle")}
                placeholder="facebook.com/yourusername or @yourusername"
              />
              {form.formState.errors.facebookHandle && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.facebookHandle.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={updateProfileMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={updateProfileMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}