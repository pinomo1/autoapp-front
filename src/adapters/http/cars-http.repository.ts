import { apiClient } from '#/services/api-client';
import type { CarRepository } from '#/repositories/cars.repository';
import { toQueryString } from './query-string';

const ENDPOINT = '/cars';

export const carsHttpRepository: CarRepository = {
  search(params) {
    const queryString = toQueryString(params);
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

  addFeature(carId, featureId) {
    return apiClient.post(`${ENDPOINT}/${carId}/features/${featureId}`);
  },

  removeFeature(carId, featureId) {
    return apiClient.delete(`${ENDPOINT}/${carId}/features/${featureId}`);
  },
};
