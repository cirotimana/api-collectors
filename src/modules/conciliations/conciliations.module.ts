import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConciliationsService } from './service/conciliations.service';
import { ConciliationsController } from './conciliations.controller';
import { Conciliation } from './entities/conciliation.entity';
import { ConciliationFile } from './entities/conciliation-file.entity';
import { ConciliationsRepository } from './repository/conciliations.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Conciliation, ConciliationFile])],
  controllers: [ConciliationsController],
  providers: [ConciliationsService, ConciliationsRepository],
})
export class ConciliationsModule {}
