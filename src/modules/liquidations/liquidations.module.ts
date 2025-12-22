import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidationsService } from './liquidations.service';
import { LiquidationsController } from './liquidations.controller';
import { Liquidation } from '../../entities/liquidation.entity';
import { LiquidationFile } from '../../entities/liquidation-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Liquidation, LiquidationFile])],
  controllers: [LiquidationsController],
  providers: [LiquidationsService],
})
export class LiquidationsModule {}
