import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Droplet, Ruler } from "lucide-react";

interface PlantDetails {
  commonName: string;
  scientificName: string;
  confidence: number;
  type?: string;
  lightNeeds?: string;
  matureSize?: string;
  imageUrl?: string;
}

interface PlantIdentificationCardProps {
  plant: PlantDetails;
  alternatives?: PlantDetails[];
  onAddToGarden: () => void;
  onSelectAlternative?: (plant: PlantDetails) => void;
}

export function PlantIdentificationCard({
  plant,
  alternatives,
  onAddToGarden,
  onSelectAlternative,
}: PlantIdentificationCardProps) {
  const isHighConfidence = plant.confidence >= 85;
  const isMediumConfidence = plant.confidence >= 60 && plant.confidence < 85;

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) {
      return (
        <Badge className="bg-chart-2 text-white border-chart-2" data-testid="badge-confidence-high">
          ✓ {confidence}% Match
        </Badge>
      );
    } else if (confidence >= 60) {
      return (
        <Badge variant="outline" className="bg-chart-4/20 border-chart-4 text-foreground" data-testid="badge-confidence-medium">
          ~ {confidence}% Match
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-muted" data-testid="badge-confidence-low">
          ? {confidence}% Match
        </Badge>
      );
    }
  };

  return (
    <Card className="overflow-hidden" data-testid="card-plant-identification">
      {plant.imageUrl && (
        <div className="relative aspect-square bg-muted">
          <img
            src={plant.imageUrl}
            alt={plant.commonName}
            className="w-full h-full object-cover"
            data-testid="img-plant"
          />
          <div className="absolute top-2 right-2">
            {getConfidenceBadge(plant.confidence)}
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="font-display text-2xl text-primary" data-testid="text-plant-name">
          {plant.commonName}
        </CardTitle>
        {plant.scientificName && (
          <p className="text-sm font-mono italic text-muted-foreground" data-testid="text-scientific-name">
            {plant.scientificName}
          </p>
        )}
      </CardHeader>

      {isHighConfidence && (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {plant.type && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium" data-testid="text-plant-type">{plant.type}</span>
              </div>
            )}
            {plant.lightNeeds && (
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-chart-4" />
                <span data-testid="text-light-needs">{plant.lightNeeds}</span>
              </div>
            )}
            {plant.matureSize && (
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span data-testid="text-mature-size">{plant.matureSize}</span>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {isMediumConfidence && alternatives && alternatives.length > 0 && (
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">It could also be:</p>
          <div className="space-y-2">
            {alternatives.map((alt, index) => (
              <button
                key={index}
                onClick={() => onSelectAlternative?.(alt)}
                className="w-full text-left p-2 rounded-md border border-border hover-elevate active-elevate-2"
                data-testid={`button-alternative-${index}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{alt.commonName}</span>
                  <span className="text-xs text-muted-foreground">{alt.confidence}% match</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      )}

      <CardFooter>
        <Button onClick={onAddToGarden} className="w-full" data-testid="button-add-to-garden">
          Add to Clorofil
        </Button>
      </CardFooter>
    </Card>
  );
}
