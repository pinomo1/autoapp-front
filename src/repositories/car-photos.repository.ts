import type {
  CarPhotoResponseDto,
  CreateCarPhotoDto,
  IdResponseDto,
  UpdateCarPhotoDto,
} from '#/types';

export interface CarPhotoRepository {
  getByCarId(carId: string): Promise<CarPhotoResponseDto[]>;
  getById(carId: string, photoId: string): Promise<CarPhotoResponseDto>;
  create(carId: string, photo: CreateCarPhotoDto): Promise<IdResponseDto>;
  update(carId: string, photoId: string, photo: UpdateCarPhotoDto): Promise<IdResponseDto>;
  delete(carId: string, photoId: string): Promise<void>;
}
