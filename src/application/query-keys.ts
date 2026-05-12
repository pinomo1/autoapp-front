import type { BrandSearchDto, CarSearchDto, CountrySearchDto, FeatureSearchDto } from '#/types';

export const queryKeys = {
  brands: {
    all: ['brands'] as const,
    search: (params: BrandSearchDto) => ['brands', 'search', params] as const,
    options: () => ['brands', 'options'] as const,
    detail: (id: string) => ['brands', id] as const,
  },
  countries: {
    all: ['countries'] as const,
    search: (params: CountrySearchDto) => ['countries', 'search', params] as const,
    options: () => ['countries', 'options'] as const,
    detail: (id: string) => ['countries', id] as const,
  },
  features: {
    all: ['features'] as const,
    search: (params: FeatureSearchDto) => ['features', 'search', params] as const,
    detail: (id: string) => ['features', id] as const,
  },
  cars: {
    all: ['cars'] as const,
    search: (params: CarSearchDto) => ['cars', 'search', params] as const,
    detail: (id: string) => ['cars', id] as const,
  },
  carPhotos: {
    byCar: (carId: string) => ['car-photos', carId] as const,
    detail: (carId: string, photoId: string) => ['car-photos', carId, photoId] as const,
  },
  meta: {
    carEnums: () => ['meta', 'car-enums'] as const,
  },
};
