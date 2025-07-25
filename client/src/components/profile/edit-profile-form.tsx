import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Edit, Save, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  surfingExperience: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  phoneNumber: z.string().optional(),
  instagramHandle: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  user: UserType;
  onCancel: () => void;
}

export default function EditProfileForm({ user, onCancel }: EditProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      location: user.location || "",
      bio: user.bio || "",
      surfingExperience: (user.surfingExperience as "beginner" | "intermediate" | "advanced" | "expert") || "intermediate",
      phoneNumber: user.phoneNumber || "",
      instagramHandle: user.instagramHandle || "",
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