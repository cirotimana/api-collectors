import { IsArray, IsDateString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConciliationReportDto {
  @IsNotEmpty()
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  collectorIds: number[];

  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @IsNotEmpty()
  @IsDateString()
  toDate: string;
}
