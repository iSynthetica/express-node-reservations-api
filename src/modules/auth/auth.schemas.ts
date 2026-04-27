import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).max(50),
    password: z.string().min(6).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1).max(50),
    password: z.string().min(1).max(128),
  }),
});

export type RegisterInputSchema = z.infer<typeof registerSchema>;
export type LoginInputSchema = z.infer<typeof loginSchema>;
