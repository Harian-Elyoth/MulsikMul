import {
  CREATE_PLANTS_TABLE,
  CREATE_WATERING_SCHEDULE_TABLE,
  ADD_ACQUIRED_AT_COLUMN,
  CREATE_PLANT_CARE_INFO_TABLE,
  MIGRATIONS,
} from '../schema';

describe('CREATE_PLANTS_TABLE', () => {
  it('creates plants table with IF NOT EXISTS guard', () => {
    expect(CREATE_PLANTS_TABLE).toContain('CREATE TABLE IF NOT EXISTS plants');
  });

  it('defines id as INTEGER PRIMARY KEY AUTOINCREMENT', () => {
    expect(CREATE_PLANTS_TABLE).toContain('id');
    expect(CREATE_PLANTS_TABLE).toContain('INTEGER PRIMARY KEY AUTOINCREMENT');
  });

  it('defines name as NOT NULL TEXT', () => {
    expect(CREATE_PLANTS_TABLE).toContain('name');
    expect(CREATE_PLANTS_TABLE).toContain('TEXT    NOT NULL');
  });

  it('includes optional columns species, perenual_id, photo_uri, notes', () => {
    expect(CREATE_PLANTS_TABLE).toContain('species');
    expect(CREATE_PLANTS_TABLE).toContain('perenual_id');
    expect(CREATE_PLANTS_TABLE).toContain('photo_uri');
    expect(CREATE_PLANTS_TABLE).toContain('notes');
  });

  it('includes created_at as NOT NULL INTEGER', () => {
    expect(CREATE_PLANTS_TABLE).toContain('created_at');
    expect(CREATE_PLANTS_TABLE).toContain('INTEGER NOT NULL');
  });
});

describe('CREATE_WATERING_SCHEDULE_TABLE', () => {
  it('creates watering_schedule table with IF NOT EXISTS guard', () => {
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain(
      'CREATE TABLE IF NOT EXISTS watering_schedule'
    );
  });

  it('defines id as INTEGER PRIMARY KEY AUTOINCREMENT', () => {
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('INTEGER PRIMARY KEY AUTOINCREMENT');
  });

  it('defines plant_id as NOT NULL UNIQUE with foreign key reference', () => {
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('plant_id');
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('NOT NULL UNIQUE');
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('REFERENCES plants(id)');
  });

  it('cascades delete on plant removal', () => {
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('ON DELETE CASCADE');
  });

  it('defines interval_days with DEFAULT 7', () => {
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('interval_days');
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('DEFAULT 7');
  });

  it('includes last_watered_at and notification_id columns', () => {
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('last_watered_at');
    expect(CREATE_WATERING_SCHEDULE_TABLE).toContain('notification_id');
  });
});

describe('ADD_ACQUIRED_AT_COLUMN', () => {
  it('is an ALTER TABLE ADD COLUMN statement for plants', () => {
    expect(ADD_ACQUIRED_AT_COLUMN).toContain('ALTER TABLE plants');
    expect(ADD_ACQUIRED_AT_COLUMN).toContain('ADD COLUMN acquired_at');
    expect(ADD_ACQUIRED_AT_COLUMN).toContain('INTEGER');
  });
});

describe('CREATE_PLANT_CARE_INFO_TABLE', () => {
  it('creates plant_care_info table with IF NOT EXISTS guard', () => {
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain(
      'CREATE TABLE IF NOT EXISTS plant_care_info'
    );
  });

  it('defines plant_id as NOT NULL UNIQUE with foreign key reference', () => {
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain('plant_id');
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain('NOT NULL UNIQUE');
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain('REFERENCES plants(id)');
  });

  it('cascades delete on plant removal', () => {
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain('ON DELETE CASCADE');
  });

  it('includes sunlight, poisonous_to_pets, and care_tips columns', () => {
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain('sunlight');
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain('poisonous_to_pets');
    expect(CREATE_PLANT_CARE_INFO_TABLE).toContain('care_tips');
  });
});

describe('MIGRATIONS', () => {
  it('is an array with four entries', () => {
    expect(Array.isArray(MIGRATIONS)).toBe(true);
    expect(MIGRATIONS).toHaveLength(4);
  });

  it('first migration is CREATE_PLANTS_TABLE', () => {
    expect(MIGRATIONS[0]).toBe(CREATE_PLANTS_TABLE);
  });

  it('second migration is CREATE_WATERING_SCHEDULE_TABLE', () => {
    expect(MIGRATIONS[1]).toBe(CREATE_WATERING_SCHEDULE_TABLE);
  });

  it('third migration is ADD_ACQUIRED_AT_COLUMN', () => {
    expect(MIGRATIONS[2]).toBe(ADD_ACQUIRED_AT_COLUMN);
  });

  it('fourth migration is CREATE_PLANT_CARE_INFO_TABLE', () => {
    expect(MIGRATIONS[3]).toBe(CREATE_PLANT_CARE_INFO_TABLE);
  });
});
