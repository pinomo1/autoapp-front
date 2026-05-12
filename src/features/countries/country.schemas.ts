import { z } from 'zod'

export const createCountrySchema = z.object({
  countryName: z
    .string()
    .trim()
    .min(2, 'Country name must be at least 2 characters long')
    .max(100, 'Country name must be at most 100 characters long'),
  countryCode: z
    .string()
    .trim()
    .min(2, 'Country code must be at least 2 characters long')
    .max(10, 'Country code must be at most 10 characters long'),
});

export const updateCountrySchema = createCountrySchema;

export type CreateCountryFormValues = z.infer<typeof createCountrySchema>;
export type UpdateCountryFormValues = z.infer<typeof updateCountrySchema>;