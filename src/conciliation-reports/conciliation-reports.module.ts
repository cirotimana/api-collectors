import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliationReportsService } from './conciliation-reports.service';
import { ConciliationReportsController } from './conciliation-reports.controller';
import { CalimacoRecord } from '../entities/calimaco-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalimacoRecord])],
  controllers: [ConciliationReportsController],
  providers: [ConciliationReportsService],
  exports: [ConciliationReportsService],
})
export class ConciliationReportsModule {}