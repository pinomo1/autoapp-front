import type {
  CarDetailsResponseDto,
  CarListItemResponseDto,
  CarSearchDto,
  CreateCarDto,
  IdResponseDto,
  PaginatedResult,
  UpdateCarDto,
} from '#/types';

export interface CarRepository {
  search(params: CarSearchDto): Promise<PaginatedResult<CarListItemResponseDto>>;
  getById(id: string): Promise<CarDetailsResponseDto>;
  create(data: CreateCarDto): Promise<IdResponseDto>;
  update(id: string, data: UpdateCarDto): Promise<IdResponseDto>;
  delete(id: string): Promise<void>;
  addFeature(carId: string, featureId: string): Promise<void>;
  removeFeature(carId: string, featureId: string): Promise<void>;
}
