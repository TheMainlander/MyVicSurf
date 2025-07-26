import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Users, HelpCircle } from "lucide-react";
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";
import AdminQuickNav from "@/components/admin/admin-quick-nav";
import type { CarouselImage } from "@shared/schema";

interface CarouselImageForm {
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  sortOrder: number;
}

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CarouselImageForm>({
    name: "",
    description: "",
    imageUrl: "",
    location: "",
    sortOrder: 0
  });

  // Fetch carousel images
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['/api/admin/carousel-images'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/carousel-images');
      return await response.json() as CarouselImage[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CarouselImageForm) => {
      const response = await apiRequest('POST', '/api/admin/carousel-images', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/carousel-images'] });
      setIsAdding(false);
      resetForm();
      toast({
        title: "Success",
        description: "Carousel image created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create carousel image",
        variant: "destructive"
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CarouselImageForm> }) => {
      const response = await apiRequest('PUT', `/api/admin/carousel-images/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/carousel-images'] });
      setEditingId(null);
      resetForm();
      toast({
        title: "Success",
        description: "Carousel image updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update carousel image",
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/carousel-images/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/carousel-images'] });
      toast({
        title: "Success",
        description: "Carousel image deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete carousel image",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      location: "",
      sortOrder: 0
    });
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingId(image.id);
    setFormData({
      name: image.name,
      description: image.description || "",
      imageUrl: image.imageUrl,
      location: image.location || "",
      sortOrder: image.sortOrder || 0
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-blue via-ocean-blue to-teal-dark">
        <Header />
        <main className="max-w-4xl mx-auto px-4 pb-20 pt-6">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mt-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-blue via-ocean-blue to-teal-dark">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pb-20 pt-6">
        <AdminNavigationHeader
          currentPath="/admin"
          title="Admin Panel"
          description="Manage carousel images and user accounts"
          additionalActions={
            <>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = '/admin/users'}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = '/admin/help'}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Admin Help
              </Button>
            </>
          }
        />
        
        <AdminQuickNav currentPath="/admin" userRole="super_admin" />

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-white text-ocean-blue hover:bg-white/90"
            disabled={isAdding || editingId !== null}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Image
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900">{editingId ? 'Edit Image' : 'Add New Image'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Beach name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beach description"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Location"
                />
              </div>
              
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images List */}
        <div className="space-y-4">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={image.imageUrl}
                    alt={image.name}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{image.name}</h3>
                    <p className="text-sm text-gray-700 mb-1">{image.description}</p>
                    <p className="text-xs text-gray-600">{image.location} • Order: {image.sortOrder}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(image)}
                      disabled={isAdding || editingId !== null}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(image.id)}
                      disabled={deleteMutation.isPending || isAdding || editingId !== null}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}