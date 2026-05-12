import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '#/application/dependencies';
import { queryKeys } from '#/application/query-keys';
import { queryPolicies } from '#/application/query-policies';
import type { BrandSearchDto, CreateBrandDto, UpdateBrandDto } from '#/types';

export const useBrandSearch = (params: BrandSearchDto) => {
  return useQuery({
    queryKey: queryKeys.brands.search(params),
    queryFn: () => repositories.brands.search(params),
  });
};

export const useBrandOptions = () => {
  return useQuery({
    queryKey: queryKeys.brands.options(),
    queryFn: () => repositories.brands.search(),
  });
};

export const useBrandById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.brands.detail(id),
    queryFn: () => repositories.brands.getById(id),
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrandDto) => repositories.brands.create(data),
    onSuccess: () => {
      queryPolicies.brands.afterCreate(queryClient);
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) =>
      repositories.brands.update(id, data),
    onSuccess: (_, { id }) => {
      queryPolicies.brands.afterUpdate(queryClient, id);
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.brands.delete(id),
    onSuccess: () => {
      queryPolicies.brands.afterDelete(queryClient);
    },
  });
};

export const useUploadBrandLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      repositories.brands.uploadLogo(id, file),
    onSuccess: (_, { id }) => {
      queryPolicies.brands.afterUploadLogo(queryClient, id);
    },
  });
};
