import { z } from 'zod';

export const createBrandSchema = z.object({
  brandName: z
    .string()
    .trim()
    .min(2, 'Brand name must be at least 2 characters long')
    .max(100, 'Brand name must be at most 100 characters long'),
  countryId: z.uuid('Country ID must be a valid GUID'),
});

export const updateBrandSchema = createBrandSchema;

export type CreateBrandFormValues = z.infer<typeof createBrandSchema>;
export type UpdateBrandFormValues = z.infer<typeof updateBrandSchema>;
