import type { AuthRepositoryPort } from './auth.repository.port';
import type { AuthUser, CreateAuthUserInput, PublicAuthUser } from './auth.types';
import { getAuthDb, type AuthDatabase } from './infra/auth-sqlite.db';

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

interface SelectUserStatement {
  get(username: string): UserRow | undefined;
}

interface InsertUserResult {
  lastInsertRowid: number | bigint;
}

interface InsertUserStatement {
  run(username: string, passwordHash: string, createdAt: number): InsertUserResult;
}

interface AuthDatabaseWithStatements extends AuthDatabase {
  prepare(sql: string): SelectUserStatement | InsertUserStatement;
}

export class AuthSqliteRepository implements AuthRepositoryPort {
  constructor(
    private readonly db: AuthDatabaseWithStatements = getAuthDb() as AuthDatabaseWithStatements,
  ) {}

  findByUsername(username: string): Promise<AuthUser | null> {
    const stmt = this.db.prepare(
      `SELECT id, username, password_hash, created_at
       FROM users
       WHERE username = ?`,
    ) as SelectUserStatement;

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

    const insertStmt = this.db.prepare(
      `INSERT INTO users (username, password_hash, created_at)
       VALUES (?, ?, ?)`,
    ) as InsertUserStatement;

    const result = insertStmt.run(input.username, input.passwordHash, createdAt);

    return Promise.resolve({
      id: Number(result.lastInsertRowid),
      username: input.username,
    });
  }
}
