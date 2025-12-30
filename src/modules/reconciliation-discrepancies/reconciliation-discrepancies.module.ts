import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReconciliationDiscrepanciesService } from './service/reconciliation-discrepancies.service';
import { ReconciliationDiscrepanciesController } from './reconciliation-discrepancies.controller';
import { ReconciliationDiscrepancy } from './entities/reconciliation-discrepancies.entity';
import { Liquidation } from '../liquidations/entities/liquidation.entity';
import { Conciliation } from '../conciliations/entities/conciliation.entity';
import { ReconciliationDiscrepanciesRepository } from './repository/reconciliation-discrepancies.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReconciliationDiscrepancy,
      Liquidation,
      Conciliation
    ])
  ],
  controllers: [ReconciliationDiscrepanciesController],
  providers: [ReconciliationDiscrepanciesService, ReconciliationDiscrepanciesRepository],
  exports: [ReconciliationDiscrepanciesService],
})
export class ReconciliationDiscrepanciesModule {}
