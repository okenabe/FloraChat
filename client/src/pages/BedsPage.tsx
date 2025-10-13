import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/lib/userContext";
import { GardenBedCard } from "@/components/GardenBedCard";
import { Button } from "@/components/ui/button";
import { Plus, Sprout, MessageSquare, Grid3x3 } from "lucide-react";
import type { GardenBed, Plant } from "@shared/schema";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function BedsPage() {
  const { user } = useUser();
  const [location] = useLocation();

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
            <Button data-testid="button-new-bed" disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Bed
            </Button>
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
                <GardenBedCard
                  key={bed.id}
                  bedName={bed.bedName}
                  sunExposure={bed.sunExposure || undefined}
                  soilMoisture={bed.soilMoisture || undefined}
                  bedSize={bed.bedSizeSqft || undefined}
                  plants={(plantsMap[bed.id] || []).map((plant) => ({
                    id: plant.id,
                    commonName: plant.commonName,
                    quantity: plant.quantity || 1,
                    healthStatus: (plant.healthStatus as any) || "ok",
                    imageUrl: plant.imageUrl || undefined,
                  }))}
                  onAddPlant={() => console.log("Add plant to", bed.bedName)}
                  onViewDetails={() => console.log("View details for", bed.bedName)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
