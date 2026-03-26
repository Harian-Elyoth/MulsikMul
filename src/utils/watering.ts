import { WateringSchedule } from '../types/plant';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDaysUntilWatering(schedule: WateringSchedule): number {
  if (!schedule.last_watered_at) {
    return 0;
  }
  const nextWateringMs = schedule.last_watered_at + schedule.interval_days * MS_PER_DAY;
  const remainingMs = nextWateringMs - Date.now();
  return Math.ceil(remainingMs / MS_PER_DAY);
}

export function isOverdue(schedule: WateringSchedule): boolean {
  return getDaysUntilWatering(schedule) < 0;
}

export function isDueSoon(schedule: WateringSchedule, thresholdDays: number = 1): boolean {
  const days = getDaysUntilWatering(schedule);
  return days >= 0 && days <= thresholdDays;
}

export function getWateringStatus(schedule: WateringSchedule): 'overdue' | 'due_soon' | 'ok' {
  if (isOverdue(schedule)) return 'overdue';
  if (isDueSoon(schedule)) return 'due_soon';
  return 'ok';
}

export function formatDaysUntilWatering(schedule: WateringSchedule): string {
  const days = getDaysUntilWatering(schedule);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Water today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}
