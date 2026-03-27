import { CareGuide, PlantDetail } from '../types/plant';

// Ordered list of care sections to include with their display labels
const CARE_SECTIONS: [type: string, label: string][] = [
  ['watering', 'Watering'],
  ['sunlight', 'Sunlight'],
  ['pruning', 'Pruning'],
];

export function buildCareNotes(detail: PlantDetail, careGuide: CareGuide | null): string {
  const parts: string[] = [];

  if (careGuide && careGuide.section && careGuide.section.length > 0) {
    for (const [sectionType, label] of CARE_SECTIONS) {
      const section = careGuide.section.find(
        (s) => s.type.toLowerCase() === sectionType
      );
      if (section) {
        parts.push(`${label}:\n${section.description}`);
      }
    }
  }

  const facts: string[] = [];

  if (detail.care_level) {
    facts.push(`Care level: ${detail.care_level}`);
  }
  if (detail.indoor) {
    facts.push('Indoor-friendly');
  }
  if (detail.drought_tolerant) {
    facts.push('Drought-tolerant');
  }
  if (detail.poisonous_to_pets > 0) {
    facts.push('WARNING: Toxic to pets');
  }
  if (detail.poisonous_to_humans > 0) {
    facts.push('WARNING: Toxic to humans');
  }

  if (facts.length > 0) {
    parts.push(facts.join('\n'));
  }

  return parts.join('\n\n');
}
