import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { MIGRATIONS } from './schema';
import { DB_NAME } from '../config';

const DatabaseContext = createContext<SQLiteDatabase | null>(null);

export function useDatabase(): SQLiteDatabase {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return db;
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const database = await openDatabaseAsync(DB_NAME);
      await database.execAsync('PRAGMA journal_mode = WAL;');
      await database.execAsync('PRAGMA foreign_keys = ON;');
      const versionResult = await database.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
      );
      const currentVersion = versionResult?.user_version ?? 0;
      for (let i = currentVersion; i < MIGRATIONS.length; i++) {
        await database.execAsync(MIGRATIONS[i]);
        await database.execAsync(`PRAGMA user_version = ${i + 1}`);
      }
      if (mounted) {
        setDb(database);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  if (!db) {
    return null;
  }

  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  );
}
