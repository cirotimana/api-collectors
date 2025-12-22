import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

export class UpdateCollectorRecordDto {
  @IsOptional()
  @IsNumber()
  collectorId?: number;

  @IsOptional()
  @IsDateString()
  recordDate?: string;

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
