import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectorRecordsService } from './collector-records.service';
import { CollectorRecordsController } from './collector-records.controller';
import { CollectorRecord } from '../../entities/collector-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollectorRecord])],
  controllers: [CollectorRecordsController],
  providers: [CollectorRecordsService],
  exports: [CollectorRecordsService],
})
export class CollectorRecordsModule {}
