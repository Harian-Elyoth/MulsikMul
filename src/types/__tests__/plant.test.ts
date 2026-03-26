import {
  PlantSummary,
  PlantDetail,
  CareGuideSection,
  CareGuide,
  PerenualListResponse,
  LocalPlant,
  WateringSchedule,
} from '../plant';

// Type-level tests: verify objects conforming to each interface are valid at runtime

describe('LocalPlant', () => {
  it('accepts a fully populated plant', () => {
    const plant: LocalPlant = {
      id: 1,
      name: 'Monstera',
      species: 'Monstera deliciosa',
      perenual_id: 42,
      photo_uri: 'file://photo.jpg',
      notes: 'Loves indirect light',
      created_at: 1700000000000,
    };
    expect(plant.id).toBe(1);
    expect(plant.name).toBe('Monstera');
    expect(plant.created_at).toBe(1700000000000);
  });

  it('accepts a plant with all nullable fields set to null', () => {
    const plant: LocalPlant = {
      id: 2,
      name: 'Cactus',
      species: null,
      perenual_id: null,
      photo_uri: null,
      notes: null,
      created_at: 1700000000001,
    };
    expect(plant.species).toBeNull();
    expect(plant.perenual_id).toBeNull();
    expect(plant.photo_uri).toBeNull();
    expect(plant.notes).toBeNull();
  });
});

describe('WateringSchedule', () => {
  it('accepts a fully populated schedule', () => {
    const schedule: WateringSchedule = {
      id: 1,
      plant_id: 1,
      interval_days: 7,
      last_watered_at: 1700000000000,
      notification_id: 'notif-abc',
    };
    expect(schedule.plant_id).toBe(1);
    expect(schedule.interval_days).toBe(7);
  });

  it('accepts schedule with nullable fields as null', () => {
    const schedule: WateringSchedule = {
      id: 2,
      plant_id: 3,
      interval_days: 14,
      last_watered_at: null,
      notification_id: null,
    };
    expect(schedule.last_watered_at).toBeNull();
    expect(schedule.notification_id).toBeNull();
  });
});

describe('PlantSummary', () => {
  it('accepts a summary with a default_image', () => {
    const summary: PlantSummary = {
      id: 10,
      common_name: 'Fiddle Leaf Fig',
      scientific_name: ['Ficus lyrata'],
      cycle: 'Perennial',
      watering: 'Average',
      sunlight: ['Full sun'],
      default_image: {
        thumbnail: 'https://example.com/thumb.jpg',
        small_url: 'https://example.com/small.jpg',
        medium_url: 'https://example.com/medium.jpg',
        original_url: 'https://example.com/original.jpg',
      },
    };
    expect(summary.common_name).toBe('Fiddle Leaf Fig');
    expect(summary.default_image).not.toBeNull();
  });

  it('accepts a summary with null default_image', () => {
    const summary: PlantSummary = {
      id: 11,
      common_name: 'Unknown Plant',
      scientific_name: [],
      cycle: 'Annual',
      watering: 'Minimum',
      sunlight: [],
      default_image: null,
    };
    expect(summary.default_image).toBeNull();
  });
});

describe('PerenualListResponse', () => {
  it('wraps a list of items with pagination metadata', () => {
    const response: PerenualListResponse<PlantSummary> = {
      data: [],
      to: 0,
      per_page: 30,
      current_page: 1,
      from: 1,
      last_page: 1,
      total: 0,
    };
    expect(response.per_page).toBe(30);
    expect(response.data).toEqual([]);
  });
});

describe('CareGuide', () => {
  it('accepts a care guide with sections', () => {
    const section: CareGuideSection = {
      type: 'watering',
      description: 'Water every 7 days',
    };
    const guide: CareGuide = {
      id: 1,
      species_id: 42,
      common_name: 'Monstera',
      scientific_name: ['Monstera deliciosa'],
      section: [section],
    };
    expect(guide.section).toHaveLength(1);
    expect(guide.section[0].type).toBe('watering');
  });
});
