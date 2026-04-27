import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

let dbInstance: Database.Database | null = null;

function ensureDbDirectory(dbPath: string): void {
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
}

function bootstrapSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

export function getAuthDb(
  dbPath: string = process.env.AUTH_DB_PATH ?? 'data/auth.sqlite',
): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const resolvedPath = path.resolve(dbPath);
  ensureDbDirectory(resolvedPath);

  const db = new Database(resolvedPath);
  bootstrapSchema(db);

  dbInstance = db;
  return dbInstance;
}
