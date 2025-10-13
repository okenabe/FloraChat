import { GardenBedCard } from "../GardenBedCard";

export default function GardenBedCardExample() {
  const herbGarden = {
    bedName: "Herb Garden",
    sunExposure: "Full sun",
    soilMoisture: "Medium",
    bedSize: 12,
    plants: [
      {
        id: "1",
        commonName: "Lavender",
        quantity: 3,
        healthStatus: "thriving" as const,
      },
      {
        id: "2",
        commonName: "Rosemary",
        quantity: 2,
        healthStatus: "thriving" as const,
      },
      {
        id: "3",
        commonName: "Basil",
        quantity: 5,
        healthStatus: "ok" as const,
      },
    ],
  };

  const shadyCorner = {
    bedName: "Shady Corner",
    sunExposure: "Full shade",
    soilMoisture: "Moist",
    bedSize: 8,
    plants: [
      {
        id: "4",
        commonName: "Hostas",
        quantity: 4,
        healthStatus: "thriving" as const,
      },
    ],
  };

  const emptyBed = {
    bedName: "Front Yard Border",
    sunExposure: "Partial sun",
    plants: [],
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <GardenBedCard
        {...herbGarden}
        onAddPlant={() => console.log("Add plant to Herb Garden")}
        onViewDetails={() => console.log("View Herb Garden details")}
      />
      <GardenBedCard
        {...shadyCorner}
        onAddPlant={() => console.log("Add plant to Shady Corner")}
        onViewDetails={() => console.log("View Shady Corner details")}
      />
      <GardenBedCard
        {...emptyBed}
        onAddPlant={() => console.log("Add plant to Front Yard")}
        onViewDetails={() => console.log("View Front Yard details")}
      />
    </div>
  );
}
