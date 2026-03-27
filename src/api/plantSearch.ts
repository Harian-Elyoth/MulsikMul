import { HOUSEPLANTS, HouseplantEntry } from '../data/houseplants';

export function searchPlants(query: string): HouseplantEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return HOUSEPLANTS.filter(
    (p) =>
      p.common_name.toLowerCase().includes(q) ||
      p.scientific_name.toLowerCase().includes(q)
  );
}

export function getPlantById(id: string): HouseplantEntry | null {
  return HOUSEPLANTS.find((p) => p.id === id) ?? null;
}
