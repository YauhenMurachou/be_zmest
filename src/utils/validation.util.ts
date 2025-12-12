import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(100, 'Username must be at most 100 characters');
export const titleSchema = z.string().min(1, 'Title is required').max(255, 'Title must be at most 255 characters');
export const contentSchema = z.string().min(1, 'Content is required');

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const postCreateSchema = z.object({
  title: titleSchema,
  content: contentSchema,
});

export const postUpdateSchema = z.object({
  title: titleSchema.optional(),
  content: contentSchema.optional(),
}).refine((data) => data.title !== undefined || data.content !== undefined, {
  message: 'At least one field (title or content) must be provided',
});


