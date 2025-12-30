import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCalimacoRecordDto {
  @IsNotEmpty()
  @IsNumber()
  collectorId: number;

  @IsNotEmpty()
  @IsString()
  calimacoId: string;

  @IsOptional()
  @IsString()
  calimacoIdNormalized?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  recordDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  modificationDate?: Date;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
