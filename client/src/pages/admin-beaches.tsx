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
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import type { SurfSpot } from "@shared/schema";

export default function AdminBeachesPage() {
  const { toast } = useToast();
  const [editingSpots, setEditingSpots] = useState<Set<number>>(new Set());
  const [showNewSpotForm, setShowNewSpotForm] = useState(false);
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

  const { data: spots = [], isLoading } = useQuery<SurfSpot[]>({
    queryKey: ["/api/surf-spots"],
  });

  const updateSpotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SurfSpot> }) => {
      const response = await apiRequest("PUT", `/api/admin/surf-spots/${id}`, data);
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

  const handleCreateSpot = () => {
    if (!newSpot.name || !newSpot.region) {
      toast({
        title: "Missing Information",
        description: "Beach name and region are required.",
        variant: "destructive",
      });
      return;
    }
    createSpotMutation.mutate(newSpot);
  };

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

  const handleSave = (spotId: number) => {
    // Collect form data for the specific spot
    const form = document.getElementById(`spot-form-${spotId}`) as HTMLFormElement;
    if (!form) return;

    const formData = new FormData(form);
    const facilitiesStr = formData.get(`facilities-${spotId}`) as string;
    const hazardsStr = formData.get(`hazards-${spotId}`) as string;
    
    const updatedData: Partial<SurfSpot> = {
      name: formData.get(`name-${spotId}`) as string,
      region: formData.get(`region-${spotId}`) as string,
      latitude: parseFloat(formData.get(`lat-${spotId}`) as string),
      longitude: parseFloat(formData.get(`lng-${spotId}`) as string),
      difficulty: formData.get(`difficulty-${spotId}`) as any,
      beachType: formData.get(`beachType-${spotId}`) as any,
      beachCategory: formData.get(`category-${spotId}`) as any,
      imageUrl: formData.get(`image-${spotId}`) as string,
      description: formData.get(`description-${spotId}`) as string,
      accessInfo: formData.get(`access-${spotId}`) as string,
      bestConditions: formData.get(`conditions-${spotId}`) as string,
      facilities: facilitiesStr ? facilitiesStr.split(',').map(f => f.trim()).filter(Boolean) : [],
      hazards: hazardsStr ? hazardsStr.split(',').map(h => h.trim()).filter(Boolean) : [],
    };

    updateSpotMutation.mutate({ id: spotId, data: updatedData });
    stopEditing(spotId);
  };

  const handleDelete = (spotId: number) => {
    if (confirm("Are you sure you want to delete this beach? This action cannot be undone.")) {
      deleteSpotMutation.mutate(spotId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-deep-blue via-ocean-blue to-teal-dark">
        <Header />
        <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">
          <AdminNavigationHeader 
            currentPath="/admin/beaches"
            title="Beach Management"
            description="Loading beach information..."
          />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-blue via-ocean-blue to-teal-dark">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">
        <AdminNavigationHeader 
          currentPath="/admin/beaches"
          title="Beach Management"
          description="Edit beach information, images, and content for Victoria Beaches & Surf Spots"
        />

        <div className="space-y-6">
          {/* Add New Beach Button */}
          {!showNewSpotForm && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowNewSpotForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Beach
              </Button>
            </div>
          )}

          {/* New Beach Form */}
          {showNewSpotForm && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Beach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newName">Beach Name *</Label>
                    <Input
                      id="newName"
                      value={newSpot.name || ""}
                      onChange={(e) => setNewSpot(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Bells Beach"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newRegion">Region *</Label>
                    <Input
                      id="newRegion"
                      value={newSpot.region || ""}
                      onChange={(e) => setNewSpot(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="Torquay"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newLat">Latitude</Label>
                    <Input
                      id="newLat"
                      type="number"
                      value={newSpot.latitude || 0}
                      onChange={(e) => setNewSpot(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                      step="0.000001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newLng">Longitude</Label>
                    <Input
                      id="newLng"
                      type="number"
                      value={newSpot.longitude || 0}
                      onChange={(e) => setNewSpot(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                      step="0.000001"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="newDifficulty">Difficulty</Label>
                    <Select value={newSpot.difficulty} onValueChange={(value) => setNewSpot(prev => ({ ...prev, difficulty: value as any }))}>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="newBeachType">Beach Type</Label>
                    <Select value={newSpot.beachType} onValueChange={(value) => setNewSpot(prev => ({ ...prev, beachType: value as any }))}>
                      <SelectTrigger className="mt-1">
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
                    <Label htmlFor="newCategory">Category</Label>
                    <Select value={newSpot.beachCategory} onValueChange={(value) => setNewSpot(prev => ({ ...prev, beachCategory: value as any }))}>
                      <SelectTrigger className="mt-1">
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

                <div>
                  <Label htmlFor="newImage">Hero Image URL</Label>
                  <Input
                    id="newImage"
                    value={newSpot.imageUrl || ""}
                    onChange={(e) => setNewSpot(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/beach-image.jpg"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="newDescription">Description</Label>
                  <Textarea
                    id="newDescription"
                    value={newSpot.description || ""}
                    onChange={(e) => setNewSpot(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Describe the beach, its unique features, and what makes it special..."
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newFacilities">Facilities (comma-separated)</Label>
                    <Input
                      id="newFacilities"
                      value={newSpot.facilities?.join(", ") || ""}
                      onChange={(e) => setNewSpot(prev => ({ 
                        ...prev, 
                        facilities: e.target.value.split(",").map(f => f.trim()).filter(Boolean)
                      }))}
                      placeholder="Parking, Toilets, Showers, Café, Surf Shop"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newHazards">Hazards (comma-separated)</Label>
                    <Input
                      id="newHazards"
                      value={newSpot.hazards?.join(", ") || ""}
                      onChange={(e) => setNewSpot(prev => ({ 
                        ...prev, 
                        hazards: e.target.value.split(",").map(h => h.trim()).filter(Boolean)
                      }))}
                      placeholder="Rocks, Strong currents, Sharks, Rips"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="newAccess">Access Information</Label>
                  <Textarea
                    id="newAccess"
                    value={newSpot.accessInfo || ""}
                    onChange={(e) => setNewSpot(prev => ({ ...prev, accessInfo: e.target.value }))}
                    rows={2}
                    placeholder="Parking directions, walking path details, access restrictions..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="newConditions">Best Conditions</Label>
                  <Input
                    id="newConditions"
                    value={newSpot.bestConditions || ""}
                    onChange={(e) => setNewSpot(prev => ({ ...prev, bestConditions: e.target.value }))}
                    placeholder="SW wind, 2-4ft swell, high tide"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateSpot}
                    disabled={createSpotMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {createSpotMutation.isPending ? "Creating..." : "Create Beach"}
                  </Button>
                  <Button
                    onClick={() => setShowNewSpotForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Beaches */}
          <div className="space-y-6">
            {spots.map((spot) => {
              const isEditing = editingSpots.has(spot.id);
              
              return (
                <Card key={spot.id} className="bg-white dark:bg-slate-800">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-ocean-blue" />
                          {spot.name}
                        </CardTitle>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{spot.region}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {isEditing ? (
                          <>
                            <Button
                              onClick={() => handleSave(spot.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => stopEditing(spot.id)}
                              size="sm"
                              variant="outline"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => startEditing(spot.id)}
                              size="sm"
                              variant="outline"
                              className="text-slate-700 dark:text-slate-300"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(spot.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form id={`spot-form-${spot.id}`} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`name-${spot.id}`}>Beach Name</Label>
                            <Input
                              name={`name-${spot.id}`}
                              defaultValue={spot.name}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`region-${spot.id}`}>Region</Label>
                            <Input
                              name={`region-${spot.id}`}
                              defaultValue={spot.region}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`lat-${spot.id}`}>Latitude</Label>
                            <Input
                              name={`lat-${spot.id}`}
                              type="number"
                              defaultValue={spot.latitude}
                              step="0.000001"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`lng-${spot.id}`}>Longitude</Label>
                            <Input
                              name={`lng-${spot.id}`}
                              type="number"
                              defaultValue={spot.longitude}
                              step="0.000001"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`difficulty-${spot.id}`}>Difficulty</Label>
                            <select
                              name={`difficulty-${spot.id}`}
                              defaultValue={spot.difficulty}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`beachType-${spot.id}`}>Beach Type</Label>
                            <select
                              name={`beachType-${spot.id}`}
                              defaultValue={spot.beachType}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="surf">Surf</option>
                              <option value="swimming">Swimming</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor={`category-${spot.id}`}>Category</Label>
                            <select
                              name={`category-${spot.id}`}
                              defaultValue={spot.beachCategory}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="surf_beach">Surf Beach</option>
                              <option value="family_beach">Family Beach</option>
                              <option value="protected_bay">Protected Bay</option>
                              <option value="ocean_beach">Ocean Beach</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`image-${spot.id}`}>Hero Image URL</Label>
                          <Input
                            name={`image-${spot.id}`}
                            defaultValue={spot.imageUrl || ""}
                            placeholder="https://example.com/beach-image.jpg"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`description-${spot.id}`}>Description</Label>
                          <Textarea
                            name={`description-${spot.id}`}
                            defaultValue={spot.description || ""}
                            rows={3}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`facilities-${spot.id}`}>Facilities (comma-separated)</Label>
                            <Input
                              name={`facilities-${spot.id}`}
                              defaultValue={spot.facilities?.join(", ") || ""}
                              placeholder="Parking, Toilets, Showers, Café"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`hazards-${spot.id}`}>Hazards (comma-separated)</Label>
                            <Input
                              name={`hazards-${spot.id}`}
                              defaultValue={spot.hazards?.join(", ") || ""}
                              placeholder="Rocks, Strong currents, Rips"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`access-${spot.id}`}>Access Information</Label>
                          <Textarea
                            name={`access-${spot.id}`}
                            defaultValue={spot.accessInfo || ""}
                            rows={2}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`conditions-${spot.id}`}>Best Conditions</Label>
                          <Input
                            name={`conditions-${spot.id}`}
                            defaultValue={spot.bestConditions || ""}
                            placeholder="SW wind, 2-4ft swell, high tide"
                            className="mt-1"
                          />
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        {spot.imageUrl && (
                          <div className="relative aspect-video w-full max-w-md">
                            <img
                              src={spot.imageUrl}
                              alt={spot.name}
                              className="rounded-lg object-cover w-full h-full"
                            />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Location:</span>
                            <p className="text-slate-600 dark:text-slate-400">{spot.latitude}, {spot.longitude}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Difficulty:</span>
                            <Badge variant="secondary" className="ml-2 capitalize">{spot.difficulty}</Badge>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Type:</span>
                            <Badge variant="outline" className="ml-2 capitalize">{spot.beachType}</Badge>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Category:</span>
                            <Badge variant="outline" className="ml-2">{spot.beachCategory?.replace('_', ' ')}</Badge>
                          </div>
                        </div>

                        {spot.description && (
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              Description:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{spot.description}</p>
                          </div>
                        )}

                        {spot.facilities && spot.facilities.length > 0 && (
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Facilities:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {spot.facilities.map((facility, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {spot.hazards && spot.hazards.length > 0 && (
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              Hazards:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {spot.hazards.map((hazard, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {hazard}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {spot.accessInfo && (
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Navigation className="h-4 w-4" />
                              Access Information:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{spot.accessInfo}</p>
                          </div>
                        )}

                        {spot.bestConditions && (
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Best Conditions:</span>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{spot.bestConditions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}