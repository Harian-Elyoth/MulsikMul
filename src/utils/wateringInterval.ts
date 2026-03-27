import { PlantDetail } from '../types/plant';

const WATERING_STRING_MAP: Record<string, number> = {
  Frequent: 3,
  Average: 7,
  Minimum: 14,
  None: 30,
};

const UNIT_MULTIPLIER: Record<string, number> = {
  days: 1,
  day: 1,
  week: 7,
  weeks: 7,
};

export function deriveWateringIntervalDays(detail: PlantDetail): number {
  const benchmark = detail.watering_general_benchmark;

  if (benchmark && benchmark.value) {
    const multiplier = UNIT_MULTIPLIER[benchmark.unit?.toLowerCase() ?? ''] ?? 1;
    const value = benchmark.value.trim();

    // Handle range like "7-10"
    const rangeMatch = value.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const low = parseInt(rangeMatch[1], 10);
      const high = parseInt(rangeMatch[2], 10);
      const avg = Math.round((low + high) / 2);
      return Math.max(1, avg * multiplier);
    }

    // Handle single number
    const single = parseInt(value, 10);
    if (!isNaN(single)) {
      return Math.max(1, single * multiplier);
    }
  }

  // Fallback to watering string
  if (detail.watering && WATERING_STRING_MAP[detail.watering] !== undefined) {
    return WATERING_STRING_MAP[detail.watering];
  }

  return 7;
}
