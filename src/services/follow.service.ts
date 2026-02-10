import { pool } from '../database/connection';

export const isFollowing = async (
  followerId: number,
  followingId: number,
): Promise<boolean> => {
  const result = await pool.query(
    `
      SELECT 1
      FROM follows
      WHERE follower_id = $1 AND following_id = $2
      LIMIT 1
    `,
    [followerId, followingId],
  );

  return result.rows.length > 0;
};

export const followUser = async (
  followerId: number,
  followingId: number,
): Promise<void> => {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  await pool.query(
    `
      INSERT INTO follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `,
    [followerId, followingId],
  );
};

export const unfollowUser = async (
  followerId: number,
  followingId: number,
): Promise<void> => {
  await pool.query(
    `
      DELETE FROM follows
      WHERE follower_id = $1 AND following_id = $2
    `,
    [followerId, followingId],
  );
};

