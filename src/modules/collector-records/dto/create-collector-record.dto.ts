import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateCollectorRecordDto {
  @IsNotEmpty()
  @IsNumber()
  collectorId: number;

  @IsNotEmpty()
  @IsDateString()
  recordDate: string;

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
