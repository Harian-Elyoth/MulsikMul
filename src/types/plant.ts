export interface PlantSummary {
  id: number;
  common_name: string;
  scientific_name: string[];
  cycle: string;
  watering: string;
  sunlight: string[];
  default_image: {
    thumbnail: string;
    small_url: string;
    medium_url: string;
    original_url: string;
  } | null;
}

export interface PlantDetail extends PlantSummary {
  description: string;
  type: string;
  dimensions: {
    min_value: number;
    max_value: number;
    unit: string;
  };
  watering_period: string | null;
  watering_general_benchmark: {
    value: string;
    unit: string;
  };
  growth_rate: string;
  maintenance: string | null;
  care_level: string | null;
  drought_tolerant: boolean;
  salt_tolerant: boolean;
  thorny: boolean;
  invasive: boolean;
  tropical: boolean;
  indoor: boolean;
  care_guides: string;
  soil: string[];
  pest_susceptibility: string[];
  flowers: boolean;
  flowering_season: string | null;
  flower_color: string;
  fruits: boolean;
  edible_fruit: boolean;
  fruit_color: string[];
  harvest_season: string | null;
  leaf: boolean;
  leaf_color: string[];
  edible_leaf: boolean;
  medicinal: boolean;
  poisonous_to_humans: number;
  poisonous_to_pets: number;
}

export interface CareGuideSection {
  type: string;
  description: string;
}

export interface CareGuide {
  id: number;
  species_id: number;
  common_name: string;
  scientific_name: string[];
  section: CareGuideSection[];
}

export interface PerenualListResponse<T> {
  data: T[];
  to: number;
  per_page: number;
  current_page: number;
  from: number;
  last_page: number;
  total: number;
}

export interface LocalPlant {
  id: number;
  name: string;
  nickname: string | null;
  species: string | null;
  perenual_id: number | null;
  photo_uri: string | null;
  notes: string | null;
  acquired_at: number | null;
  created_at: number;
}

export interface WateringSchedule {
  id: number;
  plant_id: number;
  interval_days: number;
  last_watered_at: number | null;
  notification_id: string | null;
}

export interface PlantWithSchedule extends LocalPlant {
  interval_days: number | null;
  last_watered_at: number | null;
  notification_id: string | null;
  schedule_id: number | null;
}

export interface PlantCareInfo {
  id: number;
  plant_id: number;
  sunlight: string | null;
  poisonous_to_pets: number | null;
  care_tips: string | null;
  care_tips_fr: string | null;
  care_tips_ko: string | null;
}
