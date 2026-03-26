import {
  CareGuide,
  PerenualListResponse,
  PlantDetail,
  PlantSummary,
} from '../types/plant';

export const BASE_URL = 'https://perenual.com/api';

export async function searchPlants(
  query: string,
  apiKey: string
): Promise<PlantSummary[]> {
  const url = `${BASE_URL}/species-list?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Perenual search failed: ${response.status} ${response.statusText}`);
  }
  const json: PerenualListResponse<PlantSummary> = await response.json();
  return json.data;
}

export async function getPlantDetail(
  id: number,
  apiKey: string
): Promise<PlantDetail> {
  const url = `${BASE_URL}/species/details/${id}?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Perenual detail failed: ${response.status} ${response.statusText}`);
  }
  const json: PlantDetail = await response.json();
  return json;
}

export async function getCareGuide(
  speciesId: number,
  apiKey: string
): Promise<CareGuide> {
  const url = `${BASE_URL}/species-care-guide-list?key=${encodeURIComponent(apiKey)}&species_id=${speciesId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Perenual care guide failed: ${response.status} ${response.statusText}`);
  }
  const json: PerenualListResponse<CareGuide> = await response.json();
  if (json.data.length === 0) {
    throw new Error(`No care guide found for species ${speciesId}`);
  }
  return json.data[0];
}
