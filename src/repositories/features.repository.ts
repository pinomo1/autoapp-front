import type {
  CreateFeatureDto,
  FeatureResponseDto,
  FeatureSearchDto,
  CountedResult,
  IdResponseDto,
  UpdateFeatureDto,
} from '#/types';

export interface FeatureRepository {
  search(params?: FeatureSearchDto): Promise<CountedResult<FeatureResponseDto>>;
  getById(id: string): Promise<FeatureResponseDto>;
  create(data: CreateFeatureDto): Promise<IdResponseDto>;
  update(id: string, data: UpdateFeatureDto): Promise<IdResponseDto>;
  delete(id: string): Promise<void>;
}
