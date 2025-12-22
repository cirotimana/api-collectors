import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReconciliationDiscrepanciesService } from './reconciliation-discrepancies.service';
import { ReconciliationDiscrepanciesController } from './reconciliation-discrepancies.controller';
import { ReconciliationDiscrepancy } from '../../entities/reconciliation-discrepancies.entity';
import { Liquidation } from '../../entities/liquidation.entity';
import { Conciliation } from '../../entities/conciliation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReconciliationDiscrepancy,
      Liquidation,
      Conciliation
    ])
  ],
  controllers: [ReconciliationDiscrepanciesController],
  providers: [ReconciliationDiscrepanciesService],
  exports: [ReconciliationDiscrepanciesService],
})
export class ReconciliationDiscrepanciesModule {}
