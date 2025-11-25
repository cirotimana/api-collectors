import { IsArray, IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SalesReportDto {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  collectorIds?: number[];

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}