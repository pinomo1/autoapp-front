import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '#/application/dependencies';
import { queryKeys } from '#/application/query-keys';
import { queryPolicies } from '#/application/query-policies';
import type { FeatureSearchDto, CreateFeatureDto, UpdateFeatureDto } from '#/types';

export const useFeatureSearch = (params: FeatureSearchDto) => {
  return useQuery({
    queryKey: queryKeys.features.search(params),
    queryFn: () => repositories.features.search(params),
  });
};

export const useFeatureById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.features.detail(id),
    queryFn: () => repositories.features.getById(id),
  });
};

export const useCreateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeatureDto) => repositories.features.create(data),
    onSuccess: () => {
      queryPolicies.features.afterCreate(queryClient);
    },
  });
};

export const useUpdateFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeatureDto }) =>
      repositories.features.update(id, data),
    onSuccess: (_, { id }) => {
      queryPolicies.features.afterUpdate(queryClient, id);
    },
  });
};

export const useDeleteFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.features.delete(id),
    onSuccess: () => {
      queryPolicies.features.afterDelete(queryClient);
    },
  });
};
