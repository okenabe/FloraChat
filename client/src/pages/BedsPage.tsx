import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/lib/userContext";
import { Button } from "@/components/ui/button";
import { Plus, Sprout, MessageSquare, Grid3x3, Pencil, Trash2 } from "lucide-react";
import type { GardenBed, Plant } from "@shared/schema";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Droplet, Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BedsPage() {
  const { user } = useUser();
  const [location] = useLocation();
  const { toast } = useToast();
  
  const [editingBed, setEditingBed] = useState<GardenBed | null>(null);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [deletingBed, setDeletingBed] = useState<GardenBed | null>(null);
  const [deletingPlant, setDeletingPlant] = useState<Plant | null>(null);

  const { data: beds = [], isLoading } = useQuery<GardenBed[]>({
    queryKey: ["/api/beds", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/beds?userId=${user?.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch beds');
      }
      return res.json();
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: plantsMap = {} } = useQuery<Record<string, Plant[]>>({
    queryKey: ["/api/plants/all", user?.id],
    queryFn: async () => {
      if (!beds.length) return {};
      
      const results = await Promise.all(
        beds.map(async (bed) => {
          const res = await fetch(`/api/plants?bedId=${bed.id}`);
          const plants = await res.json();
          return [bed.id, plants];
        })
      );
      
      return Object.fromEntries(results);
    },
    enabled: !!user && beds.length > 0,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const updateBedMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GardenBed> }) => {
      return await apiRequest("PATCH", `/api/beds/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beds", user?.id] });
      setEditingBed(null);
      toast({
        title: "Bed updated",
        description: "Your garden bed has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBedMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/beds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beds", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants/all", user?.id] });
      setDeletingBed(null);
      toast({
        title: "Bed deleted",
        description: "The garden bed and its plants have been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Plant> }) => {
      return await apiRequest("PATCH", `/api/plants/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants/all", user?.id] });
      setEditingPlant(null);
      toast({
        title: "Plant updated",
        description: "Your plant has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/plants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants/all", user?.id] });
      setDeletingPlant(null);
      toast({
        title: "Plant removed",
        description: "The plant has been removed from the bed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditBed = (bed: GardenBed) => {
    setEditingBed(bed);
  };

  const handleSaveBed = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBed) return;
    
    const formData = new FormData(e.currentTarget);
    updateBedMutation.mutate({
      id: editingBed.id,
      data: {
        bedName: formData.get("bedName") as string,
        sunExposure: formData.get("sunExposure") as string || null,
        soilType: formData.get("soilType") as string || null,
        soilMoisture: formData.get("soilMoisture") as string || null,
        bedSizeSqft: formData.get("bedSizeSqft") ? Number(formData.get("bedSizeSqft")) : null,
        notes: formData.get("notes") as string || null,
      },
    });
  };

  const handleEditPlant = (plant: Plant) => {
    setEditingPlant(plant);
  };

  const handleSavePlant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPlant) return;
    
    const formData = new FormData(e.currentTarget);
    const quantityValue = formData.get("quantity") as string;
    const quantity = Number(quantityValue);
    
    // Validate quantity
    if (!quantityValue || isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    updatePlantMutation.mutate({
      id: editingPlant.id,
      data: {
        commonName: formData.get("commonName") as string,
        scientificName: formData.get("scientificName") as string || null,
        quantity: quantity,
        healthStatus: formData.get("healthStatus") as string || null,
        notes: formData.get("notes") as string || null,
      },
    });
  };

  const getHealthColor = (status: string | null) => {
    switch (status) {
      case "thriving":
        return "bg-chart-2";
      case "ok":
        return "bg-chart-4";
      case "struggling":
        return "bg-destructive";
      case "dead":
        return "bg-muted-foreground";
      default:
        return "bg-chart-4";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <Sprout className="h-8 w-8 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your garden beds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-display font-semibold">Garden Beds</h1>
        </div>
        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={cn(location === "/" && "bg-accent")}
                data-testid="nav-chat-desktop"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Link href="/beds">
              <Button
                variant="ghost"
                size="sm"
                className={cn(location === "/beds" && "bg-accent")}
                data-testid="nav-beds-desktop"
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Beds
              </Button>
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold">My Garden Beds</h2>
              <p className="text-muted-foreground">
                {beds.length === 0 
                  ? "Start by chatting with the AI to create your first bed"
                  : `${beds.length} bed${beds.length === 1 ? "" : "s"}`
                }
              </p>
            </div>
          </div>

          {beds.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Sprout className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold">No garden beds yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Chat with the AI assistant to catalog your plants and create garden beds
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {beds.map((bed) => (
                <Card key={bed.id} className="hover-elevate" data-testid={`card-bed-${bed.bedName.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                    <CardTitle className="font-display text-xl" data-testid="text-bed-name">{bed.bedName}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditBed(bed)}
                        data-testid={`button-edit-bed-${bed.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingBed(bed)}
                        data-testid={`button-delete-bed-${bed.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-sm">
                      {bed.sunExposure && (
                        <div className="flex items-center gap-1.5">
                          <Sun className="h-4 w-4 text-chart-4" />
                          <span className="text-muted-foreground" data-testid="text-sun-exposure">{bed.sunExposure}</span>
                        </div>
                      )}
                      {bed.soilMoisture && (
                        <div className="flex items-center gap-1.5">
                          <Droplet className="h-4 w-4 text-chart-3" />
                          <span className="text-muted-foreground" data-testid="text-soil-moisture">{bed.soilMoisture}</span>
                        </div>
                      )}
                      {bed.bedSizeSqft && (
                        <div className="flex items-center gap-1.5">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground" data-testid="text-bed-size">{bed.bedSizeSqft} sq ft</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {!plantsMap[bed.id] || plantsMap[bed.id].length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No plants yet</p>
                      ) : (
                        plantsMap[bed.id].map((plant) => (
                          <div
                            key={plant.id}
                            className="flex items-center gap-3 p-2 rounded-md border border-border hover-elevate"
                            data-testid={`plant-item-${plant.id}`}
                          >
                            {plant.imageUrl && (
                              <div className="w-10 h-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                <img
                                  src={plant.imageUrl}
                                  alt={plant.commonName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" data-testid={`text-plant-name-${plant.id}`}>
                                {plant.commonName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Quantity: {plant.quantity || 1}
                              </p>
                            </div>
                            <div
                              className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getHealthColor(plant.healthStatus)} ${
                                plant.healthStatus === "thriving" ? "animate-pulse" : ""
                              }`}
                              data-testid={`status-${plant.healthStatus}`}
                              title={plant.healthStatus || "unknown"}
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditPlant(plant)}
                                data-testid={`button-edit-plant-${plant.id}`}
                                className="h-7 w-7"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setDeletingPlant(plant)}
                                data-testid={`button-delete-plant-${plant.id}`}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Bed Dialog */}
      <Dialog open={!!editingBed} onOpenChange={(open) => !open && setEditingBed(null)}>
        <DialogContent data-testid="dialog-edit-bed">
          <form onSubmit={handleSaveBed}>
            <DialogHeader>
              <DialogTitle>Edit Garden Bed</DialogTitle>
              <DialogDescription>
                Update the details of your garden bed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bedName">Bed Name *</Label>
                <Input
                  id="bedName"
                  name="bedName"
                  defaultValue={editingBed?.bedName}
                  required
                  data-testid="input-bed-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sunExposure">Sun Exposure</Label>
                <Input
                  id="sunExposure"
                  name="sunExposure"
                  defaultValue={editingBed?.sunExposure || ""}
                  placeholder="e.g., Full sun, Partial shade"
                  data-testid="input-sun-exposure"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Input
                  id="soilType"
                  name="soilType"
                  defaultValue={editingBed?.soilType || ""}
                  placeholder="e.g., Loamy, Clay"
                  data-testid="input-soil-type"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soilMoisture">Soil Moisture</Label>
                <Input
                  id="soilMoisture"
                  name="soilMoisture"
                  defaultValue={editingBed?.soilMoisture || ""}
                  placeholder="e.g., Moist, Well-drained"
                  data-testid="input-soil-moisture"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedSizeSqft">Bed Size (sq ft)</Label>
                <Input
                  id="bedSizeSqft"
                  name="bedSizeSqft"
                  type="number"
                  defaultValue={editingBed?.bedSizeSqft || ""}
                  placeholder="e.g., 20"
                  data-testid="input-bed-size"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingBed?.notes || ""}
                  placeholder="Additional notes..."
                  data-testid="input-bed-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingBed(null)}
                data-testid="button-cancel-edit-bed"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateBedMutation.isPending}
                data-testid="button-save-bed"
              >
                {updateBedMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plant Dialog */}
      <Dialog open={!!editingPlant} onOpenChange={(open) => !open && setEditingPlant(null)}>
        <DialogContent data-testid="dialog-edit-plant">
          <form onSubmit={handleSavePlant}>
            <DialogHeader>
              <DialogTitle>Edit Plant</DialogTitle>
              <DialogDescription>
                Update the details of this plant.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="commonName">Common Name *</Label>
                <Input
                  id="commonName"
                  name="commonName"
                  defaultValue={editingPlant?.commonName}
                  required
                  data-testid="input-plant-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scientificName">Scientific Name</Label>
                <Input
                  id="scientificName"
                  name="scientificName"
                  defaultValue={editingPlant?.scientificName || ""}
                  placeholder="e.g., Solanum lycopersicum"
                  data-testid="input-scientific-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue={editingPlant?.quantity || 1}
                  required
                  data-testid="input-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="healthStatus">Health Status</Label>
                <Input
                  id="healthStatus"
                  name="healthStatus"
                  defaultValue={editingPlant?.healthStatus || ""}
                  placeholder="e.g., thriving, ok, struggling"
                  data-testid="input-health-status"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={editingPlant?.notes || ""}
                  placeholder="Additional notes..."
                  data-testid="input-plant-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPlant(null)}
                data-testid="button-cancel-edit-plant"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePlantMutation.isPending}
                data-testid="button-save-plant"
              >
                {updatePlantMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Bed Confirmation */}
      <AlertDialog open={!!deletingBed} onOpenChange={(open) => !open && setDeletingBed(null)}>
        <AlertDialogContent data-testid="dialog-delete-bed">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Garden Bed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBed?.bedName}"? This will also remove all plants in this bed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-bed">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBed && deleteBedMutation.mutate(deletingBed.id)}
              disabled={deleteBedMutation.isPending}
              data-testid="button-confirm-delete-bed"
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteBedMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Plant Confirmation */}
      <AlertDialog open={!!deletingPlant} onOpenChange={(open) => !open && setDeletingPlant(null)}>
        <AlertDialogContent data-testid="dialog-delete-plant">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Plant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deletingPlant?.commonName}" from this bed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-plant">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPlant && deletePlantMutation.mutate(deletingPlant.id)}
              disabled={deletePlantMutation.isPending}
              data-testid="button-confirm-delete-plant"
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletePlantMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
