import type {
  CountryResponseDto,
  CountrySearchDto,
  CountedResult,
  CreateCountryDto,
  IdResponseDto,
  UpdateCountryDto,
} from '#/types';

export interface CountryRepository {
  search(params?: CountrySearchDto): Promise<CountedResult<CountryResponseDto>>;
  getById(id: string): Promise<CountryResponseDto>;
  create(data: CreateCountryDto): Promise<IdResponseDto>;
  update(id: string, data: UpdateCountryDto): Promise<IdResponseDto>;
  delete(id: string): Promise<void>;
}
