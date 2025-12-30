import { IsOptional, IsNumber, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCollectorRecordDto {
  @IsOptional()
  @IsNumber()
  collectorId?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  recordDate?: Date;

  @IsOptional()
  @IsString()
  calimacoId?: string;

  @IsOptional()
  @IsString()
  calimacoIdNormalized?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  providerStatus?: string;
}
