import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';

export class UpdateCalimacoRecordDto {
  @IsOptional()
  @IsNumber()
  collectorId?: number;

  @IsOptional()
  @IsString()
  calimacoId?: string;

  @IsOptional()
  @IsString()
  calimacoIdNormalized?: string;

  @IsOptional()
  @IsDateString()
  recordDate?: string;

  @IsOptional()
  @IsDateString()
  modificationDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
