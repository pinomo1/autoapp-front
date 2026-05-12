import { apiClient } from '#/services/api-client';
import type { FeatureRepository } from '#/repositories/features.repository';
import { toQueryString } from './query-string';

const ENDPOINT = '/features';

export const featuresHttpRepository: FeatureRepository = {
  search(params) {
    const queryString = params ? toQueryString(params) : '';
    return apiClient.get(`${ENDPOINT}${queryString ? `?${queryString}` : ''}`);
  },

  getById(id) {
    return apiClient.get(`${ENDPOINT}/${id}`);
  },

  create(data) {
    return apiClient.post(ENDPOINT, data);
  },

  update(id, data) {
    return apiClient.put(`${ENDPOINT}/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`${ENDPOINT}/${id}`);
  },
};
