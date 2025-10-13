import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface PlantSummary {
  commonName: string;
  scientificName?: string;
  quantity?: number;
  datePlanted?: string;
  sunExposure?: string;
  healthStatus?: string;
  notes?: string;
}

interface ConfirmationSummaryProps {
  bedName: string;
  plant: PlantSummary;
  onSave: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

export function ConfirmationSummary({
  bedName,
  plant,
  onSave,
  onEdit,
  onCancel,
}: ConfirmationSummaryProps) {
  return (
    <Card className="border-primary/50" data-testid="card-confirmation">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Ready to Save
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold" data-testid="text-bed-name">
            {bedName}
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display text-primary" data-testid="text-plant-name">
              {plant.commonName}
            </span>
            {plant.scientificName && (
              <span className="text-sm font-mono italic text-muted-foreground" data-testid="text-scientific-name">
                ({plant.scientificName})
              </span>
            )}
          </div>

          <div className="grid gap-2 text-sm">
            {plant.quantity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium" data-testid="text-quantity">{plant.quantity}</span>
              </div>
            )}
            {plant.datePlanted && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planted:</span>
                <span className="font-medium" data-testid="text-date-planted">{plant.datePlanted}</span>
              </div>
            )}
            {plant.sunExposure && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sun:</span>
                <span className="font-medium" data-testid="text-sun-exposure">{plant.sunExposure}</span>
              </div>
            )}
            {plant.healthStatus && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="bg-chart-2/20 text-chart-2" data-testid="badge-health-status">
                  {plant.healthStatus}
                </Badge>
              </div>
            )}
            {plant.notes && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-xs mb-1">Notes:</p>
                <p className="text-sm" data-testid="text-notes">{plant.notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        <Button onClick={onSave} className="flex-1" data-testid="button-save">
          Save to Catalog
        </Button>
        <Button onClick={onEdit} variant="outline" data-testid="button-edit">
          Edit
        </Button>
        <Button onClick={onCancel} variant="ghost" data-testid="button-cancel">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
