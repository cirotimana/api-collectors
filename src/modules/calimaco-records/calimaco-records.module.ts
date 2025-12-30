import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalimacoRecordsService } from './service/calimaco-records.service';
import { CalimacoRecordsController } from './calimaco-records.controller';
import { CalimacoRecord } from './entities/calimaco-record.entity';
import { CalimacoRecordsRepository } from './repository/calimaco-records.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CalimacoRecord])],
  controllers: [CalimacoRecordsController],
  providers: [CalimacoRecordsService, CalimacoRecordsRepository],
  exports: [CalimacoRecordsService],
})
export class CalimacoRecordsModule {}
