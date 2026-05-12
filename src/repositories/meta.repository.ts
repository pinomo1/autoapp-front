import type { CarEnumOptionsResponseDto } from '#/types';

export interface MetaRepository {
  getCarEnums(): Promise<CarEnumOptionsResponseDto>;
}
