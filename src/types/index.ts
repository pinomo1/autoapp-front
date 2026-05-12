// Common Response Types
export interface CountedResult<T> {
  items: T[];
  totalCount: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// Mutation Response Types
export interface IdResponseDto {
  id: string;
}

// Brand Types
export interface BrandResponseDto {
  id: string;
  brandName: string;
  countryId: string;
  countryName: string;
  logoUrl?: string;
}

export interface CreateBrandDto {
  brandName: string;
  countryId: string;
}

export interface UpdateBrandDto {
  brandName: string;
  countryId: string;
}

export interface BrandSearchDto {
  brandName?: string;
  countryId?: string;
}

// Country Types
export interface CountryResponseDto {
  id: string;
  countryName: string;
  countryCode: string;
}

export interface CreateCountryDto {
  countryName: string;
  countryCode: string;
}

export interface UpdateCountryDto {
  countryName: string;
  countryCode: string;
}

export interface CountrySearchDto {
  countryName?: string;
}

// Feature Types
export interface FeatureResponseDto {
  id: string;
  featureName: string;
}

export interface CreateFeatureDto {
  featureName: string;
}

export interface UpdateFeatureDto {
  featureName: string;
}

export interface FeatureSearchDto {
  featureName?: string;
}

// Car Types
export type CarCondition = 'New' | 'Used' | 'Refurbished';
export type CarType = 'Sedan' | 'SUV' | 'Truck' | 'Coupe' | 'Hatchback' | 'Wagon';
export type FuelType = 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
export type TransmissionType = 'Manual' | 'Automatic' | 'CVT';
export type Color = 'Red' | 'Blue' | 'Black' | 'White' | 'Silver' | 'Gray' | 'Green' | 'Yellow' | 'Orange' | 'Brown';
export type CarSortType =
  | 'Undefined'
  | 'YearAscending'
  | 'YearDescending'
  | 'PriceAscending'
  | 'PriceDescending'
  | 'MileageAscending'
  | 'MileageDescending';

export interface CarListItemResponseDto {
  id: string;
  brandName: string;
  model: string;
  year: number;
  color: Color;
  horsepower: number;
  engineVolumeCc: number;
  price: number;
  mileage: number;
  mainPhotoUrl?: string;
}

export interface CarDetailsResponseDto extends CarListItemResponseDto {
  brandId: string;
  carCondition: CarCondition;
  carType: CarType;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  features: FeatureResponseDto[];
}

export interface CreateCarDto {
  brandId: string;
  model: string;
  year: number;
  carCondition: CarCondition;
  carType: CarType;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  color: Color;
  horsepower: number;
  engineVolumeCc: number;
  price: number;
  mileage: number;
}

export interface UpdateCarDto {
  brandId: string;
  model: string;
  year: number;
  carCondition: CarCondition;
  carType: CarType;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  color: Color;
  horsepower: number;
  engineVolumeCc: number;
  price: number;
  mileage: number;
}

export interface PaginatedQuery {
  page: number;
  pageSize: number;
}

export interface CarFilters {
  searchString?: string;
  brandName?: string;
  brandId?: string;
  carCondition?: CarCondition;
  carType?: CarType;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  color?: Color;
  year?: number;
}

export interface CarSorting {
  sortType?: CarSortType;
}

export interface CarSearchDto {
  query: PaginatedQuery;
  filters: CarFilters;
  sorting: CarSorting;
}

// Car Photo Types
export interface CarPhotoResponseDto {
  id: string;
  carId: string;
  photoUrl: string;
  displayOrder: number;
  isMainPhoto: boolean;
}

export interface CreateCarPhotoDto {
  carId: string;
  // Either provide an uploaded file or an existing URL. Prefer `file` for uploads.
  file?: File;
  photoUrl?: string;
  displayOrder?: number;
  isMainPhoto?: boolean;
}

export interface UpdateCarPhotoDto {
  // Optionally replace the photo with an uploaded file or keep the current URL.
  file?: File;
  photoUrl?: string;
  displayOrder?: number;
  isMainPhoto?: boolean;
}

// Meta Types
export interface CarEnumOptionsResponseDto {
  carConditions: string[];
  carTypes: string[];
  fuelTypes: string[];
  transmissionTypes: string[];
  colors: string[];
  carSortTypes: string[];
}
