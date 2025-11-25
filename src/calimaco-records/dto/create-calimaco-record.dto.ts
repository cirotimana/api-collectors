import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

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
  @IsDateString()
  recordDate: string;

  @IsOptional()
  @IsDateString()
  modificationDate?: string;

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