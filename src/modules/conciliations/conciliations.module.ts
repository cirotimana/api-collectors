import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliationsService } from './conciliations.service';
import { ConciliationsController } from './conciliations.controller';
import { Conciliation } from '../../entities/conciliation.entity';
import { ConciliationFile } from '../../entities/conciliation-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conciliation, ConciliationFile])],
  controllers: [ConciliationsController],
  providers: [ConciliationsService],
})
export class ConciliationsModule {}
