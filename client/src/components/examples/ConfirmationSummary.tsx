import { ConfirmationSummary } from "../ConfirmationSummary";

export default function ConfirmationSummaryExample() {
  const plantSummary = {
    commonName: "Lavender",
    scientificName: "Lavandula angustifolia",
    quantity: 3,
    datePlanted: "Spring 2024",
    sunExposure: "Full sun",
    healthStatus: "Thriving",
    notes: "Planted along the south-facing fence. Very fragrant!",
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <ConfirmationSummary
        bedName="Herb Garden"
        plant={plantSummary}
        onSave={() => console.log("Save clicked")}
        onEdit={() => console.log("Edit clicked")}
        onCancel={() => console.log("Cancel clicked")}
      />
    </div>
  );
}
