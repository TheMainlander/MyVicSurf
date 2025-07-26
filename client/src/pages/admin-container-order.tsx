import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";
import { 
  Users, 
  TrendingUp, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  HelpCircle,
  GripVertical,
  Save,
  RotateCcw
} from "lucide-react";

interface ContainerOrder {
  id: string;
  containerId: string;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CONTAINER_ICONS = {
  'beach-management': <MapPin className="h-6 w-6 text-teal-600" />,
  'carousel-management': <ImageIcon className="h-6 w-6 text-blue-600" />,
  'user-management': <Users className="h-6 w-6 text-green-600" />,
  'sales-marketing': <TrendingUp className="h-6 w-6 text-purple-600" />,
  'system-documents': <FileText className="h-6 w-6 text-orange-600" />,
  'documentation': <HelpCircle className="h-6 w-6 text-indigo-600" />
};

export default function AdminContainerOrder() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [reorderedItems, setReorderedItems] = useState<ContainerOrder[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current container order
  const { data: containerOrders, isLoading } = useQuery<ContainerOrder[]>({
    queryKey: ['/api/admin/container-order'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/container-order');
      return await response.json();
    }
  });

  // Update reordered items when data changes
  React.useEffect(() => {
    if (containerOrders) {
      setReorderedItems([...containerOrders]);
    }
  }, [containerOrders]);

  // Save container order mutation
  const saveOrderMutation = useMutation({
    mutationFn: async (newOrder: ContainerOrder[]) => {
      const response = await apiRequest('POST', '/api/admin/container-order', {
        containers: newOrder.map((item, index) => ({
          containerId: item.containerId,
          sortOrder: index + 1
        }))
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Container Order Saved",
        description: "Admin panel container order has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/container-order'] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save container order. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reset to default order mutation
  const resetOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/container-order/reset');
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Reset",
        description: "Container order has been reset to default.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/container-order'] });
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset container order. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDragStart = (e: React.DragEvent, containerId: string) => {
    setDraggedItem(containerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetContainerId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetContainerId) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...reorderedItems];
    const draggedIndex = newOrder.findIndex(item => item.containerId === draggedItem);
    const targetIndex = newOrder.findIndex(item => item.containerId === targetContainerId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    const [draggedElement] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedElement);

    setReorderedItems(newOrder);
    setDraggedItem(null);
  };

  const handleSaveOrder = () => {
    saveOrderMutation.mutate(reorderedItems);
  };

  const handleResetOrder = () => {
    resetOrderMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-300">
        <Header />
        <main className="max-w-4xl mx-auto px-4 pb-20 pt-6">
          <div className="animate-spin w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full mx-auto mt-20" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const hasChanges = containerOrders && JSON.stringify(containerOrders) !== JSON.stringify(reorderedItems);

  return (
    <div className="min-h-screen bg-gray-300">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pb-20 pt-6">
        <AdminNavigationHeader
          currentPath="/admin/container-order"
          title="Container Order Management"
          description="Drag and drop to reorder admin panel containers"
          additionalActions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleResetOrder}
                disabled={resetOrderMutation.isPending}
                className="border-gray-600 text-gray-800 hover:bg-gray-200"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button
                onClick={handleSaveOrder}
                disabled={!hasChanges || saveOrderMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveOrderMutation.isPending ? 'Saving...' : 'Save Order'}
              </Button>
            </div>
          }
        />

        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <GripVertical className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">How to Reorder</h3>
                <p className="text-sm text-gray-600">
                  Drag and drop the containers below to change their order in the admin panel. 
                  Changes are not saved until you click "Save Order".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Indicator */}
        {hasChanges && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-orange-900">Unsaved Changes</h3>
                  <p className="text-sm text-orange-700">You have reordered containers. Save to apply changes.</p>
                </div>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  Modified
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draggable Container List */}
        <div className="space-y-3">
          {reorderedItems.map((container, index) => (
            <Card
              key={container.containerId}
              className={`cursor-move transition-all hover:shadow-md ${
                draggedItem === container.containerId ? 'opacity-50 scale-95' : ''
              } ${!container.isActive ? 'opacity-60' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, container.containerId)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, container.containerId)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Order Number */}
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                  </div>

                  {/* Container Icon */}
                  <div className="flex-shrink-0">
                    {CONTAINER_ICONS[container.containerId as keyof typeof CONTAINER_ICONS] || 
                     <HelpCircle className="h-6 w-6 text-gray-500" />}
                  </div>

                  {/* Container Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {container.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {container.description}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <Badge variant={container.isActive ? "default" : "secondary"}>
                      {container.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Actions Footer */}
        {hasChanges && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Remember to save your changes
                  </span>
                </div>
                <Button
                  onClick={handleSaveOrder}
                  disabled={saveOrderMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saveOrderMutation.isPending ? 'Saving...' : 'Save Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}