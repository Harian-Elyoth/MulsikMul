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

export const MIGRATIONS = [
  CREATE_PLANTS_TABLE,
  CREATE_WATERING_SCHEDULE_TABLE,
];
