import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Droplet, Ruler, Plus, ExternalLink } from "lucide-react";

interface Plant {
  id: string;
  commonName: string;
  quantity: number;
  healthStatus: "thriving" | "ok" | "struggling" | "dead";
  imageUrl?: string;
}

interface GardenBedCardProps {
  bedName: string;
  sunExposure?: string;
  soilMoisture?: string;
  bedSize?: number;
  plants: Plant[];
  onAddPlant: () => void;
  onViewDetails: () => void;
}

export function GardenBedCard({
  bedName,
  sunExposure,
  soilMoisture,
  bedSize,
  plants,
  onAddPlant,
  onViewDetails,
}: GardenBedCardProps) {
  const getHealthColor = (status: Plant["healthStatus"]) => {
    switch (status) {
      case "thriving":
        return "bg-chart-2";
      case "ok":
        return "bg-chart-4";
      case "struggling":
        return "bg-destructive";
      case "dead":
        return "bg-muted-foreground";
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-bed-${bedName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="font-display text-xl" data-testid="text-bed-name">{bedName}</CardTitle>
        <Button
          size="icon"
          variant="ghost"
          onClick={onViewDetails}
          data-testid="button-view-details"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          {sunExposure && (
            <div className="flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-chart-4" />
              <span className="text-muted-foreground" data-testid="text-sun-exposure">{sunExposure}</span>
            </div>
          )}
          {soilMoisture && (
            <div className="flex items-center gap-1.5">
              <Droplet className="h-4 w-4 text-chart-3" />
              <span className="text-muted-foreground" data-testid="text-soil-moisture">{soilMoisture}</span>
            </div>
          )}
          {bedSize && (
            <div className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground" data-testid="text-bed-size">{bedSize} sq ft</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {plants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No plants yet</p>
          ) : (
            plants.map((plant) => (
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
                    Quantity: {plant.quantity}
                  </p>
                </div>
                <div
                  className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getHealthColor(plant.healthStatus)} ${
                    plant.healthStatus === "thriving" ? "animate-pulse" : ""
                  }`}
                  data-testid={`status-${plant.healthStatus}`}
                  title={plant.healthStatus}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          onClick={onAddPlant}
          className="w-full gap-2"
          data-testid="button-add-plant"
        >
          <Plus className="h-4 w-4" />
          Add Plant
        </Button>
      </CardFooter>
    </Card>
  );
}
