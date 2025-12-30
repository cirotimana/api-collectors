import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliationReportsService } from './service/conciliation-reports.service';
import { ConciliationReportsController } from './conciliation-reports.controller';
import { CalimacoRecord } from '../calimaco-records/entities/calimaco-record.entity';
import { ConciliationReportsRepository } from './repository/conciliation-reports.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CalimacoRecord])],
  controllers: [ConciliationReportsController],
  providers: [ConciliationReportsService, ConciliationReportsRepository],
  exports: [ConciliationReportsService],
})
export class ConciliationReportsModule {}
