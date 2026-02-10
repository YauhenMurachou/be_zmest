import { pool } from '../database/connection';
import { User, UserCreateInput, UserPublic, UserLoginInput, UserListItem } from '../types/user.types';
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

export const listUsers = async (
  page: number,
  count: number,
  searchTerm: string | undefined,
  viewerId: number | null,
): Promise<{ items: UserListItem[]; totalCount: number }> => {
  const limit = count;
  const offset = (page - 1) * count;

  const baseParams: (string | number)[] = [];
  let whereClause = '';

  if (searchTerm && searchTerm.trim().length > 0) {
    baseParams.push(`%${searchTerm.trim()}%`);
    whereClause = `WHERE u.username ILIKE $${baseParams.length}`;
  }

  const countResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM users u
      ${whereClause}
    `,
    baseParams,
  );

  const totalCount = Number(countResult.rows[0].total ?? 0);

  let result;

  if (viewerId === null) {
    const params = [...baseParams, limit, offset];
    const limitIndex = params.length - 1;
    const offsetIndex = params.length;

    result = await pool.query(
      `
        SELECT
          u.id,
          u.username,
          COALESCE(p.status, '') AS status,
          COALESCE(p.photo_small_url, NULL) AS photo_small_url,
          COALESCE(p.photo_large_url, NULL) AS photo_large_url,
          FALSE AS followed
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        ${whereClause}
        ORDER BY u.id
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
      `,
      params,
    );
  } else {
    const params: (string | number)[] = [viewerId, ...baseParams, limit, offset];
    const limitIndex = params.length - 1;
    const offsetIndex = params.length;

    const whereWithViewer =
      whereClause.length > 0
        ? whereClause.replace('WHERE', 'WHERE')
        : '';

    result = await pool.query(
      `
        SELECT
          u.id,
          u.username,
          COALESCE(p.status, '') AS status,
          COALESCE(p.photo_small_url, NULL) AS photo_small_url,
          COALESCE(p.photo_large_url, NULL) AS photo_large_url,
          CASE
            WHEN f.follower_id IS NOT NULL THEN TRUE
            ELSE FALSE
          END AS followed
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        LEFT JOIN follows f
          ON f.following_id = u.id
         AND f.follower_id = $1
        ${whereWithViewer}
        ORDER BY u.id
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
      `,
      params,
    );
  }

  const items: UserListItem[] = result.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.username),
    status: row.status === '' ? null : String(row.status),
    photos: {
      small: (row.photo_small_url as string | null) ?? null,
      large: (row.photo_large_url as string | null) ?? null,
    },
    followed: Boolean(row.followed),
  }));

  return { items, totalCount };
};

