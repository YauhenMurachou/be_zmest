import { pool } from '../database/connection';
import { Profile, ProfileContacts, ProfileUpdateInput } from '../types/profile.types';

const defaultContacts: ProfileContacts = {
  facebook: null,
  github: null,
  instagram: null,
  mainLink: null,
  twitter: null,
  vk: null,
  website: null,
  youtube: null,
};

const mapRowToProfile = (row: Record<string, unknown>): Profile => {
  const contactsValue = row.contacts ?? {};
  const contactsObject =
    typeof contactsValue === 'object' && contactsValue !== null ? contactsValue : {};

  const contacts: ProfileContacts = {
    facebook: (contactsObject as Record<string, unknown>).facebook as string | null ?? null,
    github: (contactsObject as Record<string, unknown>).github as string | null ?? null,
    instagram: (contactsObject as Record<string, unknown>).instagram as string | null ?? null,
    mainLink: (contactsObject as Record<string, unknown>).mainLink as string | null ?? null,
    twitter: (contactsObject as Record<string, unknown>).twitter as string | null ?? null,
    vk: (contactsObject as Record<string, unknown>).vk as string | null ?? null,
    website: (contactsObject as Record<string, unknown>).website as string | null ?? null,
    youtube: (contactsObject as Record<string, unknown>).youtube as string | null ?? null,
  };

  return {
    userId: Number(row.user_id),
    aboutMe: (row.about_me as string | null) ?? null,
    contacts,
    lookingForAJob: Boolean(row.looking_for_a_job),
    lookingForAJobDescription:
      (row.looking_for_a_job_description as string | null) ?? null,
    fullName: String(row.full_name ?? ''),
    status: String(row.status ?? ''),
    photos: {
      small: (row.photo_small_url as string | null) ?? null,
      large: (row.photo_large_url as string | null) ?? null,
    },
  };
};

export const getProfileByUserId = async (userId: number): Promise<Profile | null> => {
  const result = await pool.query(
    `
      SELECT
        u.id AS user_id,
        COALESCE(p.about_me, '') AS about_me,
        COALESCE(p.contacts, '{}'::jsonb) AS contacts,
        COALESCE(p.looking_for_a_job, FALSE) AS looking_for_a_job,
        COALESCE(p.looking_for_a_job_description, '') AS looking_for_a_job_description,
        COALESCE(p.full_name, u.username) AS full_name,
        COALESCE(p.status, '') AS status,
        COALESCE(p.photo_small_url, NULL) AS photo_small_url,
        COALESCE(p.photo_large_url, NULL) AS photo_large_url
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToProfile(result.rows[0]);
};

export const updateProfile = async (
  userId: number,
  input: ProfileUpdateInput,
): Promise<void> => {
  const contactsJson = {
    ...defaultContacts,
    ...input.contacts,
  };

  await pool.query(
    `
      INSERT INTO profiles (user_id, about_me, contacts, looking_for_a_job,
                            looking_for_a_job_description, full_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id)
      DO UPDATE SET
        about_me = EXCLUDED.about_me,
        contacts = EXCLUDED.contacts,
        looking_for_a_job = EXCLUDED.looking_for_a_job,
        looking_for_a_job_description = EXCLUDED.looking_for_a_job_description,
        full_name = EXCLUDED.full_name
    `,
    [
      userId,
      input.aboutMe,
      contactsJson,
      input.lookingForAJob,
      input.lookingForAJobDescription,
      input.fullName,
    ],
  );
};

export const getStatusByUserId = async (userId: number): Promise<string> => {
  const result = await pool.query(
    `
      SELECT COALESCE(p.status, '') AS status
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
    `,
    [userId],
  );

  if (result.rows.length === 0) {
    return '';
  }

  return String(result.rows[0].status ?? '');
};

export const updateStatus = async (
  userId: number,
  status: string,
): Promise<void> => {
  await pool.query(
    `
      INSERT INTO profiles (user_id, status)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET status = EXCLUDED.status
    `,
    [userId, status],
  );
};

