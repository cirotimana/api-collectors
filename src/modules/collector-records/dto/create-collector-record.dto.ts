import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCollectorRecordDto {
  @IsNotEmpty()
  @IsNumber()
  collectorId: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  recordDate: Date;

  @IsNotEmpty()
  @IsString()
  calimacoId: string;

  @IsOptional()
  @IsString()
  calimacoIdNormalized?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  providerStatus: string;
}
