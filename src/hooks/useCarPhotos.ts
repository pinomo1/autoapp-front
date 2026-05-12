import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '#/application/dependencies';
import { queryKeys } from '#/application/query-keys';
import { queryPolicies } from '#/application/query-policies';
import type { CreateCarPhotoDto, UpdateCarPhotoDto } from '#/types';

export const useCarPhotosByCarId = (carId: string) => {
  return useQuery({
    queryKey: queryKeys.carPhotos.byCar(carId),
    queryFn: () => repositories.carPhotos.getByCarId(carId),
  });
};

export const useCarPhotoById = (carId: string, photoId: string) => {
  return useQuery({
    queryKey: queryKeys.carPhotos.detail(carId, photoId),
    queryFn: () => repositories.carPhotos.getById(carId, photoId),
  });
};

export const useCreateCarPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ carId, photo }: { carId: string; photo: CreateCarPhotoDto }) =>
      repositories.carPhotos.create(carId, photo),
    onSuccess: (_, { carId }) => {
      queryPolicies.carPhotos.afterCreate(queryClient, carId);
    },
  });
};

export const useUpdateCarPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      carId,
      photoId,
      photo,
    }: {
      carId: string;
      photoId: string;
      photo: UpdateCarPhotoDto;
    }) => repositories.carPhotos.update(carId, photoId, photo),
    onSuccess: (_, { carId, photoId }) => {
      queryPolicies.carPhotos.afterUpdate(queryClient, carId, photoId);
    },
  });
};

export const useDeleteCarPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ carId, photoId }: { carId: string; photoId: string }) =>
      repositories.carPhotos.delete(carId, photoId),
    onSuccess: (_, { carId }) => {
      queryPolicies.carPhotos.afterDelete(queryClient, carId);
    },
  });
};
