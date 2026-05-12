import { apiClient } from '#/services/api-client';
import type { MetaRepository } from '#/repositories/meta.repository';

const ENDPOINT = '/meta';

export const metaHttpRepository: MetaRepository = {
  getCarEnums() {
    return apiClient.get(`${ENDPOINT}/car-enums`);
  },
};
