import { IsOptional, IsNumber, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsDate()
  @Type(() => Date)
  recordDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  modificationDate?: Date;

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
