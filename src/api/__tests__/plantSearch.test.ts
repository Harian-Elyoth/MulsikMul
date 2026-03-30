import { searchPlants, getPlantById } from '../plantSearch';
import { HOUSEPLANTS } from '../../data/houseplants';

// ─── HOUSEPLANTS data integrity ────────────────────────────────────────────

describe('HOUSEPLANTS database', () => {
  it('contains exactly 134 entries', () => {
    expect(HOUSEPLANTS).toHaveLength(134);
  });

  it('every entry has required fields', () => {
    for (const plant of HOUSEPLANTS) {
      expect(typeof plant.id).toBe('string');
      expect(plant.id.length).toBeGreaterThan(0);
      expect(typeof plant.common_name).toBe('string');
      expect(plant.common_name.length).toBeGreaterThan(0);
      expect(typeof plant.scientific_name).toBe('string');
      expect(plant.scientific_name.length).toBeGreaterThan(0);
      expect(typeof plant.interval_days).toBe('number');
      expect(plant.interval_days).toBeGreaterThan(0);
      expect(typeof plant.notes).toBe('string');
    }
  });

  it('has no duplicate ids', () => {
    const ids = HOUSEPLANTS.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ─── searchPlants ──────────────────────────────────────────────────────────

describe('searchPlants', () => {
  it('returns empty array for empty query', () => {
    expect(searchPlants('')).toEqual([]);
  });

  it('returns empty array for whitespace-only query', () => {
    expect(searchPlants('   ')).toEqual([]);
  });

  it('returns empty array when no plant matches', () => {
    expect(searchPlants('xyzzy_no_match_plant')).toEqual([]);
  });

  it('filters by common_name (substring match)', () => {
    const results = searchPlants('monstera');
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(
        r.common_name.toLowerCase().includes('monstera') ||
          r.scientific_name.toLowerCase().includes('monstera')
      ).toBe(true);
    }
  });

  it('filters by scientific_name (substring match)', () => {
    const results = searchPlants('deliciosa');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.scientific_name.toLowerCase().includes('deliciosa'))).toBe(true);
  });

  it('is case-insensitive for common_name', () => {
    const lower = searchPlants('monstera');
    const upper = searchPlants('MONSTERA');
    const mixed = searchPlants('MoNsTeRa');
    expect(upper).toEqual(lower);
    expect(mixed).toEqual(lower);
  });

  it('is case-insensitive for scientific_name', () => {
    const lower = searchPlants('monstera deliciosa');
    const upper = searchPlants('MONSTERA DELICIOSA');
    expect(upper).toEqual(lower);
  });

  it('trims leading and trailing whitespace from query', () => {
    const trimmed = searchPlants('monstera');
    const padded = searchPlants('  monstera  ');
    expect(padded).toEqual(trimmed);
  });

  it('returns all fields of matched entries', () => {
    const [result] = searchPlants('monstera deliciosa');
    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        common_name: expect.any(String),
        scientific_name: expect.any(String),
        interval_days: expect.any(Number),
        notes: expect.any(String),
      })
    );
  });

  // Criterion 3: results display in < 200ms
  it('completes a broad search in under 200ms', () => {
    const start = Date.now();
    searchPlants('a'); // broad query — matches most plants
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(200);
  });
});

// ─── getPlantById ──────────────────────────────────────────────────────────

describe('getPlantById', () => {
  it('returns the correct entry for a known id', () => {
    const plant = getPlantById('monstera-deliciosa');
    expect(plant).not.toBeNull();
    expect(plant!.id).toBe('monstera-deliciosa');
    expect(plant!.common_name).toBe('Monstera');
    expect(plant!.scientific_name).toBe('Monstera deliciosa');
  });

  it('returns null for an unknown id', () => {
    expect(getPlantById('does-not-exist')).toBeNull();
  });

  it('returns null for empty string id', () => {
    expect(getPlantById('')).toBeNull();
  });
});
