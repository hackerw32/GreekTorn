export const properties = [
  { id: 'studio_omonoia', name: 'Γκαρσονιέρα Ομόνοιας', description: 'Μικρό, θορυβώδες, φτηνό.', icon: '🏚️', buyPrice: 2000, sellPrice: 1500, happinessBonus: 5, vaultCapacity: 5000, tier: 1, requirements: { level: 1 } },
  { id: 'apartment', name: 'Διαμέρισμα Κυψέλης', description: 'Ένα αξιοπρεπές διαμέρισμα.', icon: '🏢', buyPrice: 8000, sellPrice: 6000, happinessBonus: 12, vaultCapacity: 20000, tier: 2, requirements: { level: 5 } },
  { id: 'house', name: 'Μονοκατοικία Μαρούσι', description: 'Μονοκατοικία σε ήσυχη γειτονιά.', icon: '🏠', buyPrice: 25000, sellPrice: 18000, happinessBonus: 22, vaultCapacity: 50000, tier: 3, requirements: { level: 10 } },
  { id: 'glyfada_house', name: 'Σπίτι στη Γλυφάδα', description: 'Κοντά στη θάλασσα, πολυτελές.', icon: '🏖️', buyPrice: 80000, sellPrice: 60000, happinessBonus: 35, vaultCapacity: 150000, tier: 4, requirements: { level: 15 } },
  { id: 'mykonos_villa', name: 'Βίλα στη Μύκονο', description: 'Πολυτελής βίλα με πισίνα.', icon: '🏝️', buyPrice: 250000, sellPrice: 180000, happinessBonus: 55, vaultCapacity: 500000, tier: 5, requirements: { level: 20 } },
  { id: 'mansion', name: 'Έπαυλη Εκάλης', description: 'Μέγαρο στην Εκάλη. Απόλυτη χλιδή.', icon: '🏰', buyPrice: 800000, sellPrice: 600000, happinessBonus: 80, vaultCapacity: 2000000, tier: 6, requirements: { level: 25 } },
  { id: 'private_island', name: 'Ιδιωτικό Νησί', description: 'Το δικό σου νησί στο Αιγαίο. Βασιλιάς.', icon: '🏝️', buyPrice: 5000000, sellPrice: 3500000, happinessBonus: 120, vaultCapacity: 10000000, tier: 7, requirements: { level: 30 } },
]

export function getPropertyById(id) {
  return properties.find(p => p.id === id)
}
