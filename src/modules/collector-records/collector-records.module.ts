import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectorRecordsService } from './service/collector-records.service';
import { CollectorRecordsController } from './collector-records.controller';
import { CollectorRecord } from './entities/collector-record.entity';
import { CollectorRecordsRepository } from './repository/collector-records.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CollectorRecord])],
  controllers: [CollectorRecordsController],
  providers: [CollectorRecordsService, CollectorRecordsRepository],
  exports: [CollectorRecordsService],
})
export class CollectorRecordsModule {}
