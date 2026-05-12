import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '#/application/dependencies';
import { queryKeys } from '#/application/query-keys';
import { queryPolicies } from '#/application/query-policies';
import type { CarSearchDto, CreateCarDto, UpdateCarDto } from '#/types';

export const useCarSearch = (params: CarSearchDto) => {
  return useQuery({
    queryKey: queryKeys.cars.search(params),
    queryFn: () => repositories.cars.search(params),
  });
};

export const useCarById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.cars.detail(id),
    queryFn: () => repositories.cars.getById(id),
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCarDto) => repositories.cars.create(data),
    onSuccess: () => {
      queryPolicies.cars.afterCreate(queryClient);
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarDto }) =>
      repositories.cars.update(id, data),
    onSuccess: (_, { id }) => {
      queryPolicies.cars.afterUpdate(queryClient, id);
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.cars.delete(id),
    onSuccess: () => {
      queryPolicies.cars.afterDelete(queryClient);
    },
  });
};

export const useAddCarFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ carId, featureId }: { carId: string; featureId: string }) =>
      repositories.cars.addFeature(carId, featureId),
    onSuccess: (_, { carId }) => {
      queryPolicies.cars.afterFeatureChange(queryClient, carId);
    },
  });
};

export const useRemoveCarFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ carId, featureId }: { carId: string; featureId: string }) =>
      repositories.cars.removeFeature(carId, featureId),
    onSuccess: (_, { carId }) => {
      queryPolicies.cars.afterFeatureChange(queryClient, carId);
    },
  });
};
