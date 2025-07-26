import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from "@hello-pangea/dnd";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Settings,
  LayoutPanelTop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";
import type { HomePanel, InsertHomePanel } from "@shared/schema";

interface PanelFormData {
  panelKey: string;
  title: string;
  description?: string;
  componentName: string;
  panelType: string;
  requiredRole?: string;
  isEnabled: boolean;
  sortOrder: number;
}

const COMPONENT_OPTIONS = [
  { value: "CurrentConditions", label: "Current Conditions" },
  { value: "PremiumFeaturesPanel", label: "Premium Features Panel" },
  { value: "BeachCameras", label: "Beach Cameras" },
  { value: "TideInformation", label: "Tide Information" },
  { value: "ForecastTimeline", label: "Forecast Timeline" },
  { value: "SurfSpotsList", label: "Surf Spots List" },
  { value: "SimpleFeedbackForm", label: "Feedback Form" }
];

const PANEL_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "conditional", label: "Conditional" }
];

const ROLE_OPTIONS = [
  { value: "", label: "Public (No login required)" },
  { value: "user", label: "Logged in users" },
  { value: "admin", label: "Admin only" },
  { value: "super_admin", label: "Super Admin only" }
];

export default function AdminPanels() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<HomePanel | null>(null);
  const [formData, setFormData] = useState<PanelFormData>({
    panelKey: "",
    title: "",
    description: "",
    componentName: "",
    panelType: "standard",
    requiredRole: "",
    isEnabled: true,
    sortOrder: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: panels = [], isLoading } = useQuery<HomePanel[]>({
    queryKey: ["/api/admin/home-panels"],
  });

  const createPanelMutation = useMutation({
    mutationFn: (data: InsertHomePanel) => 
      apiRequest("POST", "/api/admin/home-panels", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-panels"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Panel Created",
        description: "Home panel has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create panel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePanelMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertHomePanel> }) =>
      apiRequest("PUT", `/api/admin/home-panels/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-panels"] });
      setEditingPanel(null);
      resetForm();
      toast({
        title: "Panel Updated",
        description: "Home panel has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update panel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePanelMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/admin/home-panels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-panels"] });
      toast({
        title: "Panel Deleted",
        description: "Home panel has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete panel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const togglePanelMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: number; isEnabled: boolean }) =>
      apiRequest("PATCH", `/api/admin/home-panels/${id}/toggle`, { isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-panels"] });
      toast({
        title: "Panel Status Updated",
        description: "Panel visibility has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update panel status.",
        variant: "destructive",
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, sortOrder }: { id: number; sortOrder: number }) =>
      apiRequest("PATCH", `/api/admin/home-panels/${id}/order`, { sortOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/home-panels"] });
    },
  });

  const resetForm = () => {
    setFormData({
      panelKey: "",
      title: "",
      description: "",
      componentName: "",
      panelType: "standard",
      requiredRole: "",
      isEnabled: true,
      sortOrder: 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPanel) {
      updatePanelMutation.mutate({ 
        id: editingPanel.id, 
        data: {
          ...formData,
          settings: {}
        }
      });
    } else {
      createPanelMutation.mutate({
        ...formData,
        settings: {}
      });
    }
  };

  const handleEdit = (panel: HomePanel) => {
    setEditingPanel(panel);
    setFormData({
      panelKey: panel.panelKey,
      title: panel.title,
      description: panel.description || "",
      componentName: panel.componentName,
      panelType: panel.panelType || "standard",
      requiredRole: panel.requiredRole || "",
      isEnabled: panel.isEnabled ?? true,
      sortOrder: panel.sortOrder
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(panels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort orders for all affected panels
    items.forEach((panel, index) => {
      if (panel.sortOrder !== index) {
        updateOrderMutation.mutate({ 
          id: panel.id, 
          sortOrder: index 
        });
      }
    });
  };

  const getPanelTypeColor = (type: string) => {
    switch (type) {
      case "premium": return "bg-purple-100 text-purple-800";
      case "conditional": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AdminNavigationHeader
        currentPath="/admin/panels"
        title="Panel Management"
        description="Manage home page panel layout and ordering"
        additionalActions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Panel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Panel</DialogTitle>
                <DialogDescription>
                  Add a new panel to the home page layout.
                </DialogDescription>
              </DialogHeader>
              <PanelForm 
                formData={formData} 
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={createPanelMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-6">
        {/* Panel Management Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutPanelTop className="h-5 w-5" />
              Home Page Panels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="panels">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {panels.map((panel, index) => (
                      <Draggable key={panel.id} draggableId={panel.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-4 bg-white border rounded-lg shadow-sm ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900">{panel.title}</h3>
                                    <Badge className={getPanelTypeColor(panel.panelType || "standard")}>
                                      {panel.panelType || "standard"}
                                    </Badge>
                                    {panel.requiredRole && (
                                      <Badge variant="outline">
                                        {panel.requiredRole}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{panel.componentName}</p>
                                  {panel.description && (
                                    <p className="text-sm text-gray-500 mt-1">{panel.description}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={panel.isEnabled ?? true}
                                  onCheckedChange={(checked) =>
                                    togglePanelMutation.mutate({ 
                                      id: panel.id, 
                                      isEnabled: checked 
                                    })
                                  }
                                />
                                {panel.isEnabled ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(panel)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePanelMutation.mutate(panel.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>

      {/* Edit Panel Dialog */}
      <Dialog open={!!editingPanel} onOpenChange={(open) => !open && setEditingPanel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Panel</DialogTitle>
            <DialogDescription>
              Update panel configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <PanelForm 
            formData={formData} 
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isSubmitting={updatePanelMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PanelFormProps {
  formData: PanelFormData;
  setFormData: (data: PanelFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

function PanelForm({ formData, setFormData, onSubmit, isSubmitting }: PanelFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="panelKey">Panel Key</Label>
        <Input
          id="panelKey"
          value={formData.panelKey}
          onChange={(e) => setFormData({ ...formData, panelKey: e.target.value })}
          placeholder="e.g., current-conditions"
          required
        />
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Panel title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="componentName">Component</Label>
        <Select
          value={formData.componentName}
          onValueChange={(value) => setFormData({ ...formData, componentName: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select component" />
          </SelectTrigger>
          <SelectContent>
            {COMPONENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="panelType">Panel Type</Label>
        <Select
          value={formData.panelType}
          onValueChange={(value) => setFormData({ ...formData, panelType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PANEL_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="requiredRole">Required Role</Label>
        <Select
          value={formData.requiredRole}
          onValueChange={(value) => setFormData({ ...formData, requiredRole: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input
          id="sortOrder"
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          min="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isEnabled"
          checked={formData.isEnabled}
          onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
        />
        <Label htmlFor="isEnabled">Enable panel</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Panel"}
        </Button>
      </div>
    </form>
  );
}