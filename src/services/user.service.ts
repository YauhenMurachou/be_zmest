import { pool } from '../database/connection';
import { User, UserCreateInput, UserPublic, UserLoginInput } from '../types/user.types';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';

const mapRowToUser = (row: Record<string, unknown>): User => {
  return {
    id: Number(row.id),
    email: String(row.email),
    username: String(row.username),
    passwordHash: String(row.password_hash),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
};

const mapUserToPublic = (user: User): UserPublic => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const createUser = async (input: UserCreateInput): Promise<UserPublic> => {
  const passwordHash = await hashPassword(input.password);
  
  const result = await pool.query(
    `INSERT INTO users (email, username, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, password_hash, created_at, updated_at`,
    [input.email, input.username, passwordHash]
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to create user');
  }

  const user = mapRowToUser(result.rows[0]);
  return mapUserToPublic(user);
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT id, email, username, password_hash, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToUser(result.rows[0]);
};

export const findUserById = async (id: number): Promise<UserPublic | null> => {
  const result = await pool.query(
    `SELECT id, email, username, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: Number(row.id),
    email: String(row.email),
    username: String(row.username),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
};

export const authenticateUser = async (input: UserLoginInput): Promise<{ user: UserPublic; token: string }> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const publicUser = mapUserToPublic(user);
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return { user: publicUser, token };
};

