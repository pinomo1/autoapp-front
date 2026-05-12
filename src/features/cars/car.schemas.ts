import { z } from 'zod';

const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const carConditions = ['New', 'Used', 'Refurbished'] as const;
const carTypes = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Wagon'] as const;
const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'] as const;
const transmissionTypes = ['Manual', 'Automatic', 'CVT'] as const;
const colors = [
  'Red',
  'Blue',
  'Black',
  'White',
  'Silver',
  'Gray',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
] as const;

export const createCarSchema = z.object({
  brandId: z
    .string()
    .regex(guidRegex, 'Please select a brand'),
  model: z
    .string()
    .trim()
    .min(1, 'Model is required')
    .max(100, 'Model must be at most 100 characters long'),
  year: z
    .number({ message: 'Year is required' })
    .int('Year must be an integer')
    .min(1900, 'Year must be at least 1900')
    .max(2100, 'Year must be at most 2100'),
  carCondition: z.enum(carConditions, { message: 'Condition is required' }),
  carType: z.enum(carTypes, { message: 'Type is required' }),
  fuelType: z.enum(fuelTypes, { message: 'Fuel type is required' }),
  transmissionType: z.enum(transmissionTypes, { message: 'Transmission is required' }),
  color: z.enum(colors, { message: 'Color is required' }),
  horsepower: z
    .number({ message: 'Horsepower is required' })
    .int('Horsepower must be an integer')
    .min(1, 'Horsepower must be greater than 0'),
  engineVolumeCc: z
    .number({ message: 'Engine volume is required' })
    .int('Engine volume must be an integer')
    .min(1, 'Engine volume must be greater than 0'),
  price: z
    .number({ message: 'Price is required' })
    .positive('Price must be greater than 0'),
  mileage: z
    .number({ message: 'Mileage is required' })
    .min(0, 'Mileage must be 0 or greater'),
});

export type CreateCarFormValues = z.infer<typeof createCarSchema>;
