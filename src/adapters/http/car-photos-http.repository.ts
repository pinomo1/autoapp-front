import { apiClient } from '#/services/api-client';
import type { CarPhotoRepository } from '#/repositories/car-photos.repository';

const ENDPOINT = '/cars';

export const carPhotosHttpRepository: CarPhotoRepository = {
  getByCarId(carId) {
    return apiClient.get(`${ENDPOINT}/${carId}/photos`);
  },

  getById(carId, photoId) {
    return apiClient.get(`${ENDPOINT}/${carId}/photos/${photoId}`);
  },

  create(carId, photo) {
    // If a file is provided, send multipart/form-data
    if (photo.file) {
      const fd = new FormData();
      fd.append('file', photo.file);
      fd.append('carId', photo.carId);
      if (typeof photo.displayOrder !== 'undefined') fd.append('displayOrder', String(photo.displayOrder));
      if (typeof photo.isMainPhoto !== 'undefined') fd.append('isMainPhoto', String(photo.isMainPhoto));
      return apiClient.postFormData(`${ENDPOINT}/${carId}/photos`, fd);
    }

    // Fallback to JSON body with photoUrl
    return apiClient.post(`${ENDPOINT}/${carId}/photos`, {
      carId: photo.carId,
      photoUrl: photo.photoUrl,
      displayOrder: photo.displayOrder,
      isMainPhoto: photo.isMainPhoto,
    });
  },

  update(carId, photoId, photo) {
    if (photo.file) {
      const fd = new FormData();
      fd.append('file', photo.file);
      if (typeof photo.displayOrder !== 'undefined') fd.append('displayOrder', String(photo.displayOrder));
      if (typeof photo.isMainPhoto !== 'undefined') fd.append('isMainPhoto', String(photo.isMainPhoto));
      return apiClient.putFormData(`${ENDPOINT}/${carId}/photos/${photoId}`, fd);
    }

    return apiClient.put(`${ENDPOINT}/${carId}/photos/${photoId}`, {
      photoUrl: photo.photoUrl,
      displayOrder: photo.displayOrder,
      isMainPhoto: photo.isMainPhoto,
    });
  },

  delete(carId, photoId) {
    return apiClient.delete(`${ENDPOINT}/${carId}/photos/${photoId}`);
  },
};
