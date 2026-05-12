import { brandsHttpRepository } from '#/adapters/http/brands-http.repository';
import { carPhotosHttpRepository } from '#/adapters/http/car-photos-http.repository';
import { carsHttpRepository } from '#/adapters/http/cars-http.repository';
import { countriesHttpRepository } from '#/adapters/http/countries-http.repository';
import { featuresHttpRepository } from '#/adapters/http/features-http.repository';
import { metaHttpRepository } from '#/adapters/http/meta-http.repository';
import type {
  BrandRepository,
  CarPhotoRepository,
  CarRepository,
  CountryRepository,
  FeatureRepository,
  MetaRepository,
} from '#/repositories';

export interface ApplicationRepositories {
  brands: BrandRepository;
  carPhotos: CarPhotoRepository;
  cars: CarRepository;
  countries: CountryRepository;
  features: FeatureRepository;
  meta: MetaRepository;
}

export const repositories: ApplicationRepositories = {
  brands: brandsHttpRepository,
  carPhotos: carPhotosHttpRepository,
  cars: carsHttpRepository,
  countries: countriesHttpRepository,
  features: featuresHttpRepository,
  meta: metaHttpRepository,
};
