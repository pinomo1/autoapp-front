import { z } from 'zod'

export const createFeatureSchema = z.object({
  featureName: z
    .string()
    .trim()
    .min(2, 'Feature name must be at least 2 characters long')
    .max(100, 'Feature name must be at most 100 characters long'),
});

export const updateFeatureSchema = createFeatureSchema;

export type CreateFeatureFormValues = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureFormValues = z.infer<typeof updateFeatureSchema>;