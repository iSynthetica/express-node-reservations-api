import { z } from 'zod';

export const getByAmenitySchema = z.object({
  params: z.object({
    amenityId: z.coerce.number().int().positive(),
  }),
  query: z.object({
    date: z.coerce.number().int().positive(),
  }),
});

export const getByUserSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
});

export type GetByAmenityInput = z.infer<typeof getByAmenitySchema>;
export type GetByUserInput = z.infer<typeof getByUserSchema>;
