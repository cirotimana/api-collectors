import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectorsService } from './service/collectors.service';
import { CollectorsController } from './collectors.controller';
import { Collector } from './entities/collector.entity';
import { CollectorsRepository } from './repository/collectors.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Collector])],
  controllers: [CollectorsController],
  providers: [CollectorsService, CollectorsRepository],
  exports: [CollectorsService],
})
export class CollectorsModule {}
