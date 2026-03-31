import {
  getAllPlants,
  getPlantById,
  insertPlant,
  deletePlant,
  getWateringSchedule,
  upsertWateringSchedule,
  updateLastWatered,
  insertPlantCareInfo,
  getPlantCareInfo,
} from '../queries';
import { LocalPlant, PlantCareInfo, WateringSchedule } from '../../types/plant';

const mockPlant: LocalPlant = {
  id: 1,
  name: 'Monstera',
  species: 'Monstera deliciosa',
  perenual_id: 42,
  photo_uri: 'file://photo.jpg',
  notes: 'Loves indirect light',
  acquired_at: 1700000000000,
  created_at: 1700000000000,
};

const mockSchedule: WateringSchedule = {
  id: 1,
  plant_id: 1,
  interval_days: 7,
  last_watered_at: 1700000000000,
  notification_id: 'notif-abc',
};

function makeMockDb(overrides: Partial<{
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  runAsync: jest.Mock;
}> = {}) {
  return {
    getAllAsync: jest.fn().mockResolvedValue([mockPlant]),
    getFirstAsync: jest.fn().mockResolvedValue(mockPlant),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    ...overrides,
  } as any;
}

describe('getAllPlants', () => {
  it('calls getAllAsync with correct SQL and returns results', async () => {
    const db = makeMockDb();
    const result = await getAllPlants(db);
    expect(db.getAllAsync).toHaveBeenCalledWith('SELECT * FROM plants ORDER BY created_at DESC');
    expect(result).toEqual([mockPlant]);
  });

  it('returns empty array when no plants', async () => {
    const db = makeMockDb({ getAllAsync: jest.fn().mockResolvedValue([]) });
    const result = await getAllPlants(db);
    expect(result).toEqual([]);
  });
});

describe('getPlantById', () => {
  it('calls getFirstAsync with correct SQL and id', async () => {
    const db = makeMockDb();
    const result = await getPlantById(db, 1);
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM plants WHERE id = ?',
      [1]
    );
    expect(result).toEqual(mockPlant);
  });

  it('returns null when plant not found', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    const result = await getPlantById(db, 999);
    expect(result).toBeNull();
  });
});

describe('insertPlant', () => {
  it('inserts plant and returns lastInsertRowId', async () => {
    const db = makeMockDb();
    const { id, ...plantWithoutId } = mockPlant;
    const rowId = await insertPlant(db, plantWithoutId);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO plants'),
      [
        plantWithoutId.name,
        plantWithoutId.species,
        plantWithoutId.perenual_id,
        plantWithoutId.photo_uri,
        plantWithoutId.notes,
        plantWithoutId.acquired_at,
        plantWithoutId.created_at,
      ]
    );
    expect(rowId).toBe(1);
  });

  it('uses null for optional fields when undefined', async () => {
    const db = makeMockDb();
    const minimalPlant: Omit<LocalPlant, 'id'> = {
      name: 'Cactus',
      species: null,
      perenual_id: null,
      photo_uri: null,
      notes: null,
      acquired_at: null,
      created_at: 1700000000000,
    };
    await insertPlant(db, minimalPlant);
    const callArgs = db.runAsync.mock.calls[0][1];
    expect(callArgs[1]).toBeNull(); // species
    expect(callArgs[2]).toBeNull(); // perenual_id
    expect(callArgs[3]).toBeNull(); // photo_uri
    expect(callArgs[4]).toBeNull(); // notes
    expect(callArgs[5]).toBeNull(); // acquired_at
  });
});

describe('deletePlant', () => {
  it('calls runAsync with correct SQL and id', async () => {
    const db = makeMockDb();
    await deletePlant(db, 1);
    expect(db.runAsync).toHaveBeenCalledWith(
      'DELETE FROM plants WHERE id = ?',
      [1]
    );
  });
});

describe('getWateringSchedule', () => {
  it('calls getFirstAsync with correct SQL and plantId', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(mockSchedule) });
    const result = await getWateringSchedule(db, 1);
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM watering_schedule WHERE plant_id = ?',
      [1]
    );
    expect(result).toEqual(mockSchedule);
  });

  it('returns null when no schedule exists', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    const result = await getWateringSchedule(db, 99);
    expect(result).toBeNull();
  });
});

describe('upsertWateringSchedule', () => {
  it('calls runAsync with upsert SQL and correct values', async () => {
    const db = makeMockDb();
    const { id, ...scheduleWithoutId } = mockSchedule;
    await upsertWateringSchedule(db, scheduleWithoutId);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO watering_schedule'),
      [
        scheduleWithoutId.plant_id,
        scheduleWithoutId.interval_days,
        scheduleWithoutId.last_watered_at,
        scheduleWithoutId.notification_id,
      ]
    );
  });

  it('uses null for optional fields when null', async () => {
    const db = makeMockDb();
    const schedule: Omit<WateringSchedule, 'id'> = {
      plant_id: 2,
      interval_days: 3,
      last_watered_at: null,
      notification_id: null,
    };
    await upsertWateringSchedule(db, schedule);
    const callArgs = db.runAsync.mock.calls[0][1];
    expect(callArgs[2]).toBeNull(); // last_watered_at
    expect(callArgs[3]).toBeNull(); // notification_id
  });

  it('SQL contains ON CONFLICT upsert clause', async () => {
    const db = makeMockDb();
    const { id, ...scheduleWithoutId } = mockSchedule;
    await upsertWateringSchedule(db, scheduleWithoutId);
    const sql: string = db.runAsync.mock.calls[0][0];
    expect(sql).toContain('ON CONFLICT(plant_id) DO UPDATE SET');
  });
});

describe('updateLastWatered', () => {
  it('calls runAsync with correct SQL, timestamp and notificationId', async () => {
    const db = makeMockDb();
    await updateLastWatered(db, 1, 1700000000000, 'notif-xyz');
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE watering_schedule'),
      [1700000000000, 'notif-xyz', 1]
    );
  });

  it('defaults notificationId to null when not provided', async () => {
    const db = makeMockDb();
    await updateLastWatered(db, 2, 1700000000000);
    const callArgs = db.runAsync.mock.calls[0][1];
    expect(callArgs[1]).toBeNull();
  });
});

const mockCareInfo: PlantCareInfo = {
  id: 1,
  plant_id: 1,
  sunlight: 'bright indirect light',
  poisonous_to_pets: 1,
  care_tips: 'Water when top soil is dry.',
  care_tips_fr: 'Arroser quand le substrat est sec en surface.',
  care_tips_ko: '흙 표면이 건조해지면 물을 주세요.',
};

describe('insertPlantCareInfo', () => {
  it('calls runAsync with INSERT OR REPLACE SQL and correct values', async () => {
    const db = makeMockDb();
    const { id, ...infoWithoutId } = mockCareInfo;
    await insertPlantCareInfo(db, infoWithoutId);
    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO plant_care_info'),
      [
        infoWithoutId.plant_id,
        infoWithoutId.sunlight,
        infoWithoutId.poisonous_to_pets,
        infoWithoutId.care_tips,
        infoWithoutId.care_tips_fr,
        infoWithoutId.care_tips_ko,
      ]
    );
  });

  it('uses null for optional fields when null', async () => {
    const db = makeMockDb();
    await insertPlantCareInfo(db, {
      plant_id: 2,
      sunlight: null,
      poisonous_to_pets: null,
      care_tips: null,
      care_tips_fr: null,
      care_tips_ko: null,
    });
    const callArgs = db.runAsync.mock.calls[0][1];
    expect(callArgs[1]).toBeNull(); // sunlight
    expect(callArgs[2]).toBeNull(); // poisonous_to_pets
    expect(callArgs[3]).toBeNull(); // care_tips
    expect(callArgs[4]).toBeNull(); // care_tips_fr
    expect(callArgs[5]).toBeNull(); // care_tips_ko
  });
});

describe('getPlantCareInfo', () => {
  it('calls getFirstAsync with correct SQL and plantId', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(mockCareInfo) });
    const result = await getPlantCareInfo(db, 1);
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM plant_care_info WHERE plant_id = ?',
      [1]
    );
    expect(result).toEqual(mockCareInfo);
  });

  it('returns null when no care info exists', async () => {
    const db = makeMockDb({ getFirstAsync: jest.fn().mockResolvedValue(null) });
    const result = await getPlantCareInfo(db, 99);
    expect(result).toBeNull();
  });
});
