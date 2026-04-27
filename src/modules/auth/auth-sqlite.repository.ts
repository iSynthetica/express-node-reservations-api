import type Database from 'better-sqlite3';
import type { AuthRepositoryPort } from './auth.repository.port';
import type { AuthUser, CreateAuthUserInput, PublicAuthUser } from './auth.types';
import { getAuthDb } from './infra/auth-sqlite.db';

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

export class AuthSqliteRepository implements AuthRepositoryPort {
  constructor(private readonly db: Database.Database = getAuthDb()) {}

  findByUsername(username: string): Promise<AuthUser | null> {
    const stmt = this.db.prepare<[string], UserRow>(
      `SELECT id, username, password_hash, created_at
       FROM users
       WHERE username = ?`,
    );

    const row = stmt.get(username);
    if (!row) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    });
  }

  createUser(input: CreateAuthUserInput): Promise<PublicAuthUser> {
    const createdAt = Date.now();

    const insertStmt = this.db.prepare<[string, string, number]>(
      `INSERT INTO users (username, password_hash, created_at)
       VALUES (?, ?, ?)`,
    );

    const result = insertStmt.run(input.username, input.passwordHash, createdAt);

    return Promise.resolve({
      id: Number(result.lastInsertRowid),
      username: input.username,
    });
  }
}
