import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

export const queryPolicies = {
  brands: {
    afterCreate(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
    },
    afterUpdate(queryClient: QueryClient, id: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.detail(id) });
    },
    afterUploadLogo(queryClient: QueryClient, id: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.detail(id) });
    },
    afterDelete(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
    },
  },
  countries: {
    afterCreate(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    },
    afterUpdate(queryClient: QueryClient, id: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.countries.detail(id) });
    },
    afterDelete(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.countries.all });
    },
  },
  features: {
    afterCreate(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all });
    },
    afterUpdate(queryClient: QueryClient, id: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.features.detail(id) });
    },
    afterDelete(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.all });
    },
  },
  cars: {
    afterCreate(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
    },
    afterUpdate(queryClient: QueryClient, id: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(id) });
    },
    afterFeatureChange(queryClient: QueryClient, carId: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(carId) });
    },
    afterDelete(queryClient: QueryClient) {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
    },
  },
  carPhotos: {
    afterCreate(queryClient: QueryClient, carId: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.carPhotos.byCar(carId) });
    },
    afterUpdate(queryClient: QueryClient, carId: string, photoId: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.carPhotos.byCar(carId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.carPhotos.detail(carId, photoId) });
    },
    afterDelete(queryClient: QueryClient, carId: string) {
      queryClient.invalidateQueries({ queryKey: queryKeys.carPhotos.byCar(carId) });
    },
  },
};
