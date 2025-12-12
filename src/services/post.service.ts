import { pool } from '../database/connection';
import { Post, PostCreateInput, PostUpdateInput, PostWithAuthor } from '../types/post.types';

const mapRowToPost = (row: Record<string, unknown>): Post => {
  return {
    id: Number(row.id),
    title: String(row.title),
    content: String(row.content),
    authorId: Number(row.author_id),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
};

const mapRowToPostWithAuthor = (row: Record<string, unknown>): PostWithAuthor => {
  return {
    id: Number(row.id),
    title: String(row.title),
    content: String(row.content),
    authorId: Number(row.author_id),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
    author: {
      id: Number(row.author_id),
      username: String(row.author_username),
      email: String(row.author_email),
    },
  };
};

export const createPost = async (input: PostCreateInput, authorId: number): Promise<Post> => {
  const result = await pool.query(
    `INSERT INTO posts (title, content, author_id)
     VALUES ($1, $2, $3)
     RETURNING id, title, content, author_id, created_at, updated_at`,
    [input.title, input.content, authorId]
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to create post');
  }

  return mapRowToPost(result.rows[0]);
};

export const findPostById = async (id: number): Promise<Post | null> => {
  const result = await pool.query(
    `SELECT id, title, content, author_id, created_at, updated_at
     FROM posts
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToPost(result.rows[0]);
};

export const findPostByIdWithAuthor = async (id: number): Promise<PostWithAuthor | null> => {
  const result = await pool.query(
    `SELECT 
       p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
       u.id as author_id, u.username as author_username, u.email as author_email
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToPostWithAuthor(result.rows[0]);
};

export const findAllPosts = async (limit: number = 50, offset: number = 0): Promise<PostWithAuthor[]> => {
  const result = await pool.query(
    `SELECT 
       p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
       u.id as author_id, u.username as author_username, u.email as author_email
     FROM posts p
     JOIN users u ON p.author_id = u.id
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows.map(mapRowToPostWithAuthor);
};

export const findPostsByAuthorId = async (authorId: number, limit: number = 50, offset: number = 0): Promise<PostWithAuthor[]> => {
  const result = await pool.query(
    `SELECT 
       p.id, p.title, p.content, p.author_id, p.created_at, p.updated_at,
       u.id as author_id, u.username as author_username, u.email as author_email
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.author_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [authorId, limit, offset]
  );

  return result.rows.map(mapRowToPostWithAuthor);
};

export const updatePost = async (id: number, input: PostUpdateInput, authorId: number): Promise<Post> => {
  const post = await findPostById(id);

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.authorId !== authorId) {
    throw new Error('You do not have permission to update this post');
  }

  const updateFields: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    updateFields.push(`title = $${paramIndex}`);
    values.push(input.title);
    paramIndex++;
  }

  if (input.content !== undefined) {
    updateFields.push(`content = $${paramIndex}`);
    values.push(input.content);
    paramIndex++;
  }

  if (updateFields.length === 0) {
    return post;
  }

  values.push(id);
  const query = `
    UPDATE posts
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, title, content, author_id, created_at, updated_at
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error('Failed to update post');
  }

  return mapRowToPost(result.rows[0]);
};

export const deletePost = async (id: number, authorId: number): Promise<void> => {
  const post = await findPostById(id);

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.authorId !== authorId) {
    throw new Error('You do not have permission to delete this post');
  }

  const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    throw new Error('Failed to delete post');
  }
};

