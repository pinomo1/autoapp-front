import { apiClient } from '#/services/api-client';
import type { BrandRepository } from '#/repositories/brands.repository';
import { toQueryString } from './query-string';

const ENDPOINT = '/brands';

export const brandsHttpRepository: BrandRepository = {
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

  uploadLogo(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData(`${ENDPOINT}/${id}/logo`, formData);
  },
};
