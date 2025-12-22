import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalimacoRecordsService } from './calimaco-records.service';
import { CalimacoRecordsController } from './calimaco-records.controller';
import { CalimacoRecord } from '../../entities/calimaco-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalimacoRecord])],
  controllers: [CalimacoRecordsController],
  providers: [CalimacoRecordsService],
  exports: [CalimacoRecordsService],
})
export class CalimacoRecordsModule {}
