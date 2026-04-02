export const CREATE_PLANTS_TABLE = `
  CREATE TABLE IF NOT EXISTS plants (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    species     TEXT,
    perenual_id INTEGER,
    photo_uri   TEXT,
    notes       TEXT,
    created_at  INTEGER NOT NULL
  );
`;

export const CREATE_WATERING_SCHEDULE_TABLE = `
  CREATE TABLE IF NOT EXISTS watering_schedule (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id         INTEGER NOT NULL UNIQUE REFERENCES plants(id) ON DELETE CASCADE,
    interval_days    INTEGER NOT NULL DEFAULT 7,
    last_watered_at  INTEGER,
    notification_id  TEXT
  );
`;

export const ADD_ACQUIRED_AT_COLUMN = `
  ALTER TABLE plants ADD COLUMN acquired_at INTEGER;
`;

export const CREATE_PLANT_CARE_INFO_TABLE = `
  CREATE TABLE IF NOT EXISTS plant_care_info (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id          INTEGER NOT NULL UNIQUE REFERENCES plants(id) ON DELETE CASCADE,
    sunlight          TEXT,
    poisonous_to_pets INTEGER,
    care_tips         TEXT
  );
`;

export const ADD_CARE_TIPS_FR_COLUMN = `
  ALTER TABLE plant_care_info ADD COLUMN care_tips_fr TEXT;
`;

export const ADD_CARE_TIPS_KO_COLUMN = `
  ALTER TABLE plant_care_info ADD COLUMN care_tips_ko TEXT;
`;

export const ADD_NICKNAME_COLUMN = `
  ALTER TABLE plants ADD COLUMN nickname TEXT;
`;

export const MIGRATIONS = [
  CREATE_PLANTS_TABLE,
  CREATE_WATERING_SCHEDULE_TABLE,
  ADD_ACQUIRED_AT_COLUMN,
  CREATE_PLANT_CARE_INFO_TABLE,
  ADD_CARE_TIPS_FR_COLUMN,
  ADD_CARE_TIPS_KO_COLUMN,
  ADD_NICKNAME_COLUMN,
];
