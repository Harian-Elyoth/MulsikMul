import { SQLiteDatabase } from 'expo-sqlite';
import { LocalPlant, PlantCareInfo, PlantWithSchedule, WateringSchedule } from '../types/plant';

export async function getAllPlants(db: SQLiteDatabase): Promise<LocalPlant[]> {
  return db.getAllAsync<LocalPlant>('SELECT * FROM plants ORDER BY created_at DESC');
}

export async function getPlantById(db: SQLiteDatabase, id: number): Promise<LocalPlant | null> {
  return db.getFirstAsync<LocalPlant>('SELECT * FROM plants WHERE id = ?', [id]);
}

export async function insertPlant(
  db: SQLiteDatabase,
  plant: Omit<LocalPlant, 'id'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO plants (name, species, perenual_id, photo_uri, notes, acquired_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      plant.name,
      plant.species ?? null,
      plant.perenual_id ?? null,
      plant.photo_uri ?? null,
      plant.notes ?? null,
      plant.acquired_at ?? null,
      plant.created_at,
    ]
  );
  return result.lastInsertRowId;
}

export async function deletePlant(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM plants WHERE id = ?', [id]);
}

export async function getWateringSchedule(
  db: SQLiteDatabase,
  plantId: number
): Promise<WateringSchedule | null> {
  return db.getFirstAsync<WateringSchedule>(
    'SELECT * FROM watering_schedule WHERE plant_id = ?',
    [plantId]
  );
}

export async function upsertWateringSchedule(
  db: SQLiteDatabase,
  schedule: Omit<WateringSchedule, 'id'>
): Promise<void> {
  await db.runAsync(
    `INSERT INTO watering_schedule (plant_id, interval_days, last_watered_at, notification_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(plant_id) DO UPDATE SET
       interval_days     = excluded.interval_days,
       last_watered_at   = excluded.last_watered_at,
       notification_id   = excluded.notification_id`,
    [
      schedule.plant_id,
      schedule.interval_days,
      schedule.last_watered_at ?? null,
      schedule.notification_id ?? null,
    ]
  );
}

export async function updateLastWatered(
  db: SQLiteDatabase,
  plantId: number,
  timestamp: number,
  notificationId: string | null = null
): Promise<void> {
  await db.runAsync(
    `UPDATE watering_schedule
     SET last_watered_at = ?, notification_id = ?
     WHERE plant_id = ?`,
    [timestamp, notificationId, plantId]
  );
}

export async function getAllPlantsWithSchedule(
  db: SQLiteDatabase
): Promise<PlantWithSchedule[]> {
  return db.getAllAsync<PlantWithSchedule>(
    `SELECT p.*, ws.id AS schedule_id, ws.interval_days, ws.last_watered_at, ws.notification_id
     FROM plants p
     LEFT JOIN watering_schedule ws ON ws.plant_id = p.id
     ORDER BY p.created_at DESC`
  );
}

export async function insertPlantCareInfo(
  db: SQLiteDatabase,
  info: Omit<PlantCareInfo, 'id'>
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO plant_care_info (plant_id, sunlight, poisonous_to_pets, care_tips, care_tips_fr, care_tips_ko)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      info.plant_id,
      info.sunlight ?? null,
      info.poisonous_to_pets ?? null,
      info.care_tips ?? null,
      info.care_tips_fr ?? null,
      info.care_tips_ko ?? null,
    ]
  );
}

export async function getPlantCareInfo(
  db: SQLiteDatabase,
  plantId: number
): Promise<PlantCareInfo | null> {
  return db.getFirstAsync<PlantCareInfo>(
    'SELECT * FROM plant_care_info WHERE plant_id = ?',
    [plantId]
  );
}
