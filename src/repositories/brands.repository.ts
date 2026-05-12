import type {
  BrandResponseDto,
  BrandSearchDto,
  CountedResult,
  CreateBrandDto,
  IdResponseDto,
  UpdateBrandDto,
} from '#/types';

export interface BrandRepository {
  search(params?: BrandSearchDto): Promise<CountedResult<BrandResponseDto>>;
  getById(id: string): Promise<BrandResponseDto>;
  create(data: CreateBrandDto): Promise<IdResponseDto>;
  update(id: string, data: UpdateBrandDto): Promise<IdResponseDto>;
  delete(id: string): Promise<void>;
  uploadLogo(id: string, file: File): Promise<BrandResponseDto>;
}
