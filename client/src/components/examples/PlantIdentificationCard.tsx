import { PlantIdentificationCard } from "../PlantIdentificationCard";

export default function PlantIdentificationCardExample() {
  const highConfidencePlant = {
    commonName: "Lavender",
    scientificName: "Lavandula angustifolia",
    confidence: 92,
    type: "Perennial",
    lightNeeds: "Full sun",
    matureSize: "18-24 inches",
  };

  const mediumConfidencePlant = {
    commonName: "Salvia",
    scientificName: "Salvia officinalis",
    confidence: 68,
  };

  const alternatives = [
    { commonName: "Catmint", scientificName: "Nepeta", confidence: 18 },
    { commonName: "Russian Sage", scientificName: "Perovskia", confidence: 14 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4 max-w-4xl mx-auto">
      <PlantIdentificationCard
        plant={highConfidencePlant}
        onAddToGarden={() => console.log("Add high confidence plant")}
      />
      <PlantIdentificationCard
        plant={mediumConfidencePlant}
        alternatives={alternatives}
        onAddToGarden={() => console.log("Add medium confidence plant")}
        onSelectAlternative={(alt) => console.log("Selected alternative:", alt.commonName)}
      />
    </div>
  );
}
