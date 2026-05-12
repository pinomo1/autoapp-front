import { useQuery } from '@tanstack/react-query';
import { repositories } from '#/application/dependencies';
import { queryKeys } from '#/application/query-keys';

export const useCarEnums = () => {
  return useQuery({
    queryKey: queryKeys.meta.carEnums(),
    queryFn: () => repositories.meta.getCarEnums(),
    staleTime: Infinity, // Enums don't change, cache forever
  });
};
