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
      for (const migration of MIGRATIONS) {
        await database.execAsync(migration);
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
