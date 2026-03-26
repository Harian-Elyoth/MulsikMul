import { searchPlants, getPlantDetail, getCareGuide, BASE_URL } from '../api/perenual';
import type { PlantSummary, PlantDetail, CareGuide, PerenualListResponse } from '../types/plant';

const API_KEY = 'test-api-key';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const plantSummary: PlantSummary = {
  id: 1,
  common_name: 'European Silver Fir',
  scientific_name: ['Abies alba'],
  cycle: 'Perennial',
  watering: 'Frequent',
  sunlight: ['full sun'],
  default_image: {
    thumbnail: 'https://example.com/thumb.jpg',
    small_url: 'https://example.com/small.jpg',
    medium_url: 'https://example.com/medium.jpg',
    original_url: 'https://example.com/original.jpg',
  },
};

const plantDetail: PlantDetail = {
  ...plantSummary,
  description: 'A large evergreen conifer.',
  type: 'tree',
  dimensions: { min_value: 35, max_value: 50, unit: 'feet' },
  watering_period: null,
  watering_general_benchmark: { value: '7-10', unit: 'days' },
  growth_rate: 'High',
  maintenance: 'Low',
  care_level: 'Medium',
  drought_tolerant: false,
  salt_tolerant: false,
  thorny: false,
  invasive: false,
  tropical: false,
  indoor: false,
  care_guides: 'https://perenual.com/api/species-care-guide-list?species_id=1',
  soil: ['Moist', 'Well-Drained'],
  pest_susceptibility: ['Spider Mites'],
  flowers: false,
  flowering_season: null,
  flower_color: '',
  fruits: false,
  edible_fruit: false,
  fruit_color: [],
  harvest_season: null,
  leaf: true,
  leaf_color: ['green'],
  edible_leaf: false,
  medicinal: false,
  poisonous_to_humans: 0,
  poisonous_to_pets: 0,
};

const careGuide: CareGuide = {
  id: 1,
  species_id: 1,
  common_name: 'European Silver Fir',
  scientific_name: ['Abies alba'],
  section: [
    { type: 'Watering', description: 'Water frequently.' },
    { type: 'Sunlight', description: 'Needs full sun.' },
  ],
};

beforeEach(() => {
  mockFetch.mockReset();
});

// ─── searchPlants ──────────────────────────────────────────────────────────

describe('searchPlants', () => {
  it('returns plant summaries on success', async () => {
    const body: PerenualListResponse<PlantSummary> = {
      data: [plantSummary],
      to: 1,
      per_page: 30,
      current_page: 1,
      from: 1,
      last_page: 1,
      total: 1,
    };
    mockFetch.mockResolvedValueOnce(makeResponse(body));

    const result = await searchPlants('fir', API_KEY);

    expect(result).toEqual([plantSummary]);
  });

  it('builds the correct URL with encoded query and key', async () => {
    const body: PerenualListResponse<PlantSummary> = {
      data: [],
      to: 0,
      per_page: 30,
      current_page: 1,
      from: 0,
      last_page: 1,
      total: 0,
    };
    mockFetch.mockResolvedValueOnce(makeResponse(body));

    await searchPlants('silver fir', API_KEY);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain(`${BASE_URL}/species-list`);
    expect(calledUrl).toContain(`key=${encodeURIComponent(API_KEY)}`);
    expect(calledUrl).toContain(`q=${encodeURIComponent('silver fir')}`);
  });

  it('returns empty array when data is empty', async () => {
    const body: PerenualListResponse<PlantSummary> = {
      data: [],
      to: 0,
      per_page: 30,
      current_page: 1,
      from: 0,
      last_page: 1,
      total: 0,
    };
    mockFetch.mockResolvedValueOnce(makeResponse(body));

    const result = await searchPlants('nothing', API_KEY);
    expect(result).toEqual([]);
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, false, 401));

    await expect(searchPlants('fir', API_KEY)).rejects.toThrow(
      'Perenual search failed: 401'
    );
  });

  it('throws when fetch rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(searchPlants('fir', API_KEY)).rejects.toThrow('Network error');
  });
});

// ─── getPlantDetail ────────────────────────────────────────────────────────

describe('getPlantDetail', () => {
  it('returns plant detail on success', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(plantDetail));

    const result = await getPlantDetail(1, API_KEY);
    expect(result).toEqual(plantDetail);
  });

  it('builds the correct URL with species id', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(plantDetail));

    await getPlantDetail(42, API_KEY);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toBe(
      `${BASE_URL}/species/details/42?key=${encodeURIComponent(API_KEY)}`
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, false, 404));

    await expect(getPlantDetail(999, API_KEY)).rejects.toThrow(
      'Perenual detail failed: 404'
    );
  });

  it('throws when fetch rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('timeout'));

    await expect(getPlantDetail(1, API_KEY)).rejects.toThrow('timeout');
  });
});

// ─── getCareGuide ──────────────────────────────────────────────────────────

describe('getCareGuide', () => {
  it('returns the first care guide on success', async () => {
    const body: PerenualListResponse<CareGuide> = {
      data: [careGuide],
      to: 1,
      per_page: 30,
      current_page: 1,
      from: 1,
      last_page: 1,
      total: 1,
    };
    mockFetch.mockResolvedValueOnce(makeResponse(body));

    const result = await getCareGuide(1, API_KEY);
    expect(result).toEqual(careGuide);
  });

  it('builds the correct URL with species_id', async () => {
    const body: PerenualListResponse<CareGuide> = {
      data: [careGuide],
      to: 1,
      per_page: 30,
      current_page: 1,
      from: 1,
      last_page: 1,
      total: 1,
    };
    mockFetch.mockResolvedValueOnce(makeResponse(body));

    await getCareGuide(7, API_KEY);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain(`${BASE_URL}/species-care-guide-list`);
    expect(calledUrl).toContain('species_id=7');
    expect(calledUrl).toContain(`key=${encodeURIComponent(API_KEY)}`);
  });

  it('throws when data array is empty', async () => {
    const body: PerenualListResponse<CareGuide> = {
      data: [],
      to: 0,
      per_page: 30,
      current_page: 1,
      from: 0,
      last_page: 1,
      total: 0,
    };
    mockFetch.mockResolvedValueOnce(makeResponse(body));

    await expect(getCareGuide(1, API_KEY)).rejects.toThrow(
      'No care guide found for species 1'
    );
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, false, 403));

    await expect(getCareGuide(1, API_KEY)).rejects.toThrow(
      'Perenual care guide failed: 403'
    );
  });

  it('throws when fetch rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('DNS failure'));

    await expect(getCareGuide(1, API_KEY)).rejects.toThrow('DNS failure');
  });
});
