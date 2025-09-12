import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

const dbPath = process.env.NODE_ENV === 'production' ? '/app/data/security-tracker.db' : './security-tracker.db';
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export * from './schema';