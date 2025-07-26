import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";
import { Edit3, Save, X, Plus, Trash2, Image, MapPin, Info, Navigation, AlertTriangle } from "lucide-react";
import type { SurfSpot } from "@shared/schema";

interface EditableSpot extends SurfSpot {
  isEditing?: boolean;
}

export default function AdminBeachesPage() {
  const { toast } = useToast();
  const [editingSpots, setEditingSpots] = useState<Set<number>>(new Set());
  const [newSpot, setNewSpot] = useState<Partial<SurfSpot>>({
    name: "",
    region: "",
    latitude: 0,
    longitude: 0,
    difficulty: "beginner",
    beachType: "surf",
    beachCategory: "surf_beach",
    description: "",
    imageUrl: "",
    facilities: [],
    accessInfo: "",
    bestConditions: "",
    hazards: []
  });
  const [showNewSpotForm, setShowNewSpotForm] = useState(false);

  const { data: spots = [], isLoading } = useQuery<SurfSpot[]>({
    queryKey: ["/api/surf-spots"],
  });

  const updateSpotMutation = useMutation({
    mutationFn: async (spot: SurfSpot) => {
      const response = await apiRequest("PUT", `/api/admin/surf-spots/${spot.id}`, spot);
      if (!response.ok) throw new Error("Failed to update spot");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surf-spots"] });
      toast({
        title: "Beach Updated",
        description: "Beach information has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update beach information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createSpotMutation = useMutation({
    mutationFn: async (spot: Partial<SurfSpot>) => {
      const response = await apiRequest("POST", "/api/admin/surf-spots", spot);
      if (!response.ok) throw new Error("Failed to create spot");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surf-spots"] });
      setShowNewSpotForm(false);
      setNewSpot({
        name: "",
        region: "",
        latitude: 0,
        longitude: 0,
        difficulty: "beginner",
        beachType: "surf",
        beachCategory: "surf_beach",
        description: "",
        imageUrl: "",
        facilities: [],
        accessInfo: "",
        bestConditions: "",
        hazards: []
      });
      toast({
        title: "Beach Created",
        description: "New beach has been successfully added.",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create new beach. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSpotMutation = useMutation({
    mutationFn: async (spotId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/surf-spots/${spotId}`);
      if (!response.ok) throw new Error("Failed to delete spot");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surf-spots"] });
      toast({
        title: "Beach Deleted",
        description: "Beach has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete beach. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startEditing = (spotId: number) => {
    setEditingSpots(prev => new Set([...prev, spotId]));
  };

  const stopEditing = (spotId: number) => {
    setEditingSpots(prev => {
      const newSet = new Set(prev);
      newSet.delete(spotId);
      return newSet;
    });
  };

  const handleSave = (spot: SurfSpot) => {
    updateSpotMutation.mutate(spot);
    stopEditing(spot.id);
  };

  const handleDelete = (spotId: number) => {
    if (confirm("Are you sure you want to delete this beach? This action cannot be undone.")) {
      deleteSpotMutation.mutate(spotId);
    }
  };

  const handleCreateSpot = () => {
    if (!newSpot.name || !newSpot.region) {
      toast({
        title: "Validation Error",
        description: "Beach name and region are required.",
        variant: "destructive",
      });
      return;
    }
    createSpotMutation.mutate(newSpot);
  };

  const parseArrayField = (value: string): string[] => {
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  const arrayToString = (arr: string[]): string => {
    return arr?.join(', ') || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavigationHeader 
          currentPath="/admin/beaches"
          title="Beach Management" 
          description="Manage beach information, images, and content"
        />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigationHeader 
        currentPath="/admin/beaches"
        title="Beach Management" 
        description="Manage beach information, images, and content"
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Victoria Beaches & Surf Spots</h1>
            <p className="text-gray-600 mt-1">Manage beach information, images, and content</p>
          </div>
          <Button 
            onClick={() => setShowNewSpotForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Beach
          </Button>
        </div>

        {/* New Spot Form */}
        {showNewSpotForm && (
          <Card className="mb-6 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Beach
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewSpotForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-name">Beach Name *</Label>
                    <Input
                      id="new-name"
                      value={newSpot.name}
                      onChange={(e) => setNewSpot({ ...newSpot, name: e.target.value })}
                      placeholder="Enter beach name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-region">Region *</Label>
                    <Input
                      id="new-region"
                      value={newSpot.region}
                      onChange={(e) => setNewSpot({ ...newSpot, region: e.target.value })}
                      placeholder="Enter region"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="new-latitude">Latitude</Label>
                      <Input
                        id="new-latitude"
                        type="number"
                        step="0.000001"
                        value={newSpot.latitude}
                        onChange={(e) => setNewSpot({ ...newSpot, latitude: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-longitude">Longitude</Label>
                      <Input
                        id="new-longitude"
                        type="number"
                        step="0.000001"
                        value={newSpot.longitude}
                        onChange={(e) => setNewSpot({ ...newSpot, longitude: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-difficulty">Difficulty Level</Label>
                    <Select value={newSpot.difficulty} onValueChange={(value) => setNewSpot({ ...newSpot, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-beach-type">Beach Type</Label>
                    <Select value={newSpot.beachType} onValueChange={(value) => setNewSpot({ ...newSpot, beachType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="surf">Surf</SelectItem>
                        <SelectItem value="swimming">Swimming</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-beach-category">Beach Category</Label>
                    <Select value={newSpot.beachCategory} onValueChange={(value) => setNewSpot({ ...newSpot, beachCategory: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="surf_beach">Surf Beach</SelectItem>
                        <SelectItem value="family_beach">Family Beach</SelectItem>
                        <SelectItem value="protected_bay">Protected Bay</SelectItem>
                        <SelectItem value="ocean_beach">Ocean Beach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="new-image-url">Hero Image URL</Label>
                  <Input
                    id="new-image-url"
                    value={newSpot.imageUrl}
                    onChange={(e) => setNewSpot({ ...newSpot, imageUrl: e.target.value })}
                    placeholder="https://example.com/beach-image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea
                    id="new-description"
                    value={newSpot.description}
                    onChange={(e) => setNewSpot({ ...newSpot, description: e.target.value })}
                    placeholder="Describe the beach, its characteristics, and what makes it special..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new-facilities">Facilities (comma-separated)</Label>
                  <Input
                    id="new-facilities"
                    value={arrayToString(newSpot.facilities || [])}
                    onChange={(e) => setNewSpot({ ...newSpot, facilities: parseArrayField(e.target.value) })}
                    placeholder="Parking, Toilets, Showers, Café, Surf Shop"
                  />
                </div>
                <div>
                  <Label htmlFor="new-access-info">Access Information</Label>
                  <Textarea
                    id="new-access-info"
                    value={newSpot.accessInfo}
                    onChange={(e) => setNewSpot({ ...newSpot, accessInfo: e.target.value })}
                    placeholder="How to get to the beach, parking information, etc."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="new-best-conditions">Best Conditions</Label>
                  <Textarea
                    id="new-best-conditions"
                    value={newSpot.bestConditions}
                    onChange={(e) => setNewSpot({ ...newSpot, bestConditions: e.target.value })}
                    placeholder="Optimal wind, swell, and tide conditions"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="new-hazards">Hazards (comma-separated)</Label>
                  <Input
                    id="new-hazards"
                    value={arrayToString(newSpot.hazards || [])}
                    onChange={(e) => setNewSpot({ ...newSpot, hazards: parseArrayField(e.target.value) })}
                    placeholder="Rocks, Strong currents, Sharks, Rips"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleCreateSpot} disabled={createSpotMutation.isPending}>
                  {createSpotMutation.isPending ? "Creating..." : "Create Beach"}
                </Button>
                <Button variant="outline" onClick={() => setShowNewSpotForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Spots */}
        <div className="space-y-6">
          {spots.map((spot) => (
            <SpotEditCard
              key={spot.id}
              spot={spot}
              isEditing={editingSpots.has(spot.id)}
              onStartEdit={() => startEditing(spot.id)}
              onStopEdit={() => stopEditing(spot.id)}
              onSave={handleSave}
              onDelete={handleDelete}
              isUpdating={updateSpotMutation.isPending}
              isDeleting={deleteSpotMutation.isPending}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

interface SpotEditCardProps {
  spot: SurfSpot;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onSave: (spot: SurfSpot) => void;
  onDelete: (spotId: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function SpotEditCard({ spot, isEditing, onStartEdit, onStopEdit, onSave, onDelete, isUpdating, isDeleting }: SpotEditCardProps) {
  const [editedSpot, setEditedSpot] = useState<SurfSpot>(spot);

  const parseArrayField = (value: string): string[] => {
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  const arrayToString = (arr: string[]): string => {
    return arr?.join(', ') || '';
  };

  const handleSave = () => {
    onSave(editedSpot);
  };

  if (!isEditing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{spot.name}</h3>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {spot.region}
                </Badge>
                <Badge className={spot.beachType === 'surf' ? 'bg-blue-500' : spot.beachType === 'swimming' ? 'bg-green-500' : 'bg-purple-500'}>
                  {spot.beachType === 'both' ? 'Surf & Swimming' : spot.beachType}
                </Badge>
              </div>
              {spot.imageUrl && (
                <div className="mb-3">
                  <img 
                    src={spot.imageUrl} 
                    alt={spot.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              {spot.description && (
                <p className="text-gray-600 text-sm mb-3">{spot.description}</p>
              )}
              {spot.facilities && spot.facilities.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-700">Facilities: </span>
                  <span className="text-xs text-gray-600">{spot.facilities.join(', ')}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline" onClick={onStartEdit}>
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDelete(spot.id)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Edit3 className="w-5 h-5 mr-2" />
            Editing: {spot.name}
          </span>
          <Button variant="ghost" size="sm" onClick={onStopEdit}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor={`name-${spot.id}`}>Beach Name</Label>
              <Input
                id={`name-${spot.id}`}
                value={editedSpot.name}
                onChange={(e) => setEditedSpot({ ...editedSpot, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`region-${spot.id}`}>Region</Label>
              <Input
                id={`region-${spot.id}`}
                value={editedSpot.region}
                onChange={(e) => setEditedSpot({ ...editedSpot, region: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`latitude-${spot.id}`}>Latitude</Label>
                <Input
                  id={`latitude-${spot.id}`}
                  type="number"
                  step="0.000001"
                  value={editedSpot.latitude}
                  onChange={(e) => setEditedSpot({ ...editedSpot, latitude: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor={`longitude-${spot.id}`}>Longitude</Label>
                <Input
                  id={`longitude-${spot.id}`}
                  type="number"
                  step="0.000001"
                  value={editedSpot.longitude}
                  onChange={(e) => setEditedSpot({ ...editedSpot, longitude: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor={`difficulty-${spot.id}`}>Difficulty Level</Label>
              <Select value={editedSpot.difficulty} onValueChange={(value) => setEditedSpot({ ...editedSpot, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`beach-type-${spot.id}`}>Beach Type</Label>
              <Select value={editedSpot.beachType} onValueChange={(value) => setEditedSpot({ ...editedSpot, beachType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surf">Surf</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`beach-category-${spot.id}`}>Beach Category</Label>
              <Select value={editedSpot.beachCategory} onValueChange={(value) => setEditedSpot({ ...editedSpot, beachCategory: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surf_beach">Surf Beach</SelectItem>
                  <SelectItem value="family_beach">Family Beach</SelectItem>
                  <SelectItem value="protected_bay">Protected Bay</SelectItem>
                  <SelectItem value="ocean_beach">Ocean Beach</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor={`image-url-${spot.id}`}>Hero Image URL</Label>
            <Input
              id={`image-url-${spot.id}`}
              value={editedSpot.imageUrl || ''}
              onChange={(e) => setEditedSpot({ ...editedSpot, imageUrl: e.target.value })}
              placeholder="https://example.com/beach-image.jpg"
            />
          </div>
          <div>
            <Label htmlFor={`description-${spot.id}`}>Description</Label>
            <Textarea
              id={`description-${spot.id}`}
              value={editedSpot.description || ''}
              onChange={(e) => setEditedSpot({ ...editedSpot, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor={`facilities-${spot.id}`}>Facilities (comma-separated)</Label>
            <Input
              id={`facilities-${spot.id}`}
              value={arrayToString(editedSpot.facilities || [])}
              onChange={(e) => setEditedSpot({ ...editedSpot, facilities: parseArrayField(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor={`access-info-${spot.id}`}>Access Information</Label>
            <Textarea
              id={`access-info-${spot.id}`}
              value={editedSpot.accessInfo || ''}
              onChange={(e) => setEditedSpot({ ...editedSpot, accessInfo: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor={`best-conditions-${spot.id}`}>Best Conditions</Label>
            <Textarea
              id={`best-conditions-${spot.id}`}
              value={editedSpot.bestConditions || ''}
              onChange={(e) => setEditedSpot({ ...editedSpot, bestConditions: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor={`hazards-${spot.id}`}>Hazards (comma-separated)</Label>
            <Input
              id={`hazards-${spot.id}`}
              value={arrayToString(editedSpot.hazards || [])}
              onChange={(e) => setEditedSpot({ ...editedSpot, hazards: parseArrayField(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onStopEdit}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}