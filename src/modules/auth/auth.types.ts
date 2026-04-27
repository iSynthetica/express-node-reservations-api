export interface AuthUser {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: number;
}

export interface CreateAuthUserInput {
  username: string;
  passwordHash: string;
}

export interface PublicAuthUser {
  id: number;
  username: string;
}
