import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { repositories } from '#/application/dependencies';
import { queryKeys } from '#/application/query-keys';
import { queryPolicies } from '#/application/query-policies';
import type { CountrySearchDto, CreateCountryDto, UpdateCountryDto } from '#/types';

export const useCountrySearch = (params: CountrySearchDto) => {
  return useQuery({
    queryKey: queryKeys.countries.search(params),
    queryFn: () => repositories.countries.search(params),
  });
};

export const useCountryOptions = () => {
  return useQuery({
    queryKey: queryKeys.countries.options(),
    queryFn: () => repositories.countries.search(),
  });
};

export const useCountryById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.countries.detail(id),
    queryFn: () => repositories.countries.getById(id),
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCountryDto) => repositories.countries.create(data),
    onSuccess: () => {
      queryPolicies.countries.afterCreate(queryClient);
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCountryDto }) =>
      repositories.countries.update(id, data),
    onSuccess: (_, { id }) => {
      queryPolicies.countries.afterUpdate(queryClient, id);
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repositories.countries.delete(id),
    onSuccess: () => {
      queryPolicies.countries.afterDelete(queryClient);
    },
  });
};
