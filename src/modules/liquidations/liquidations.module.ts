import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidationsService } from './service/liquidations.service';
import { LiquidationsController } from './liquidations.controller';
import { Liquidation } from './entities/liquidation.entity';
import { LiquidationFile } from './entities/liquidation-file.entity';
import { LiquidationsRepository } from './repository/liquidations.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Liquidation, LiquidationFile])],
  controllers: [LiquidationsController],
  providers: [LiquidationsService, LiquidationsRepository],
})
export class LiquidationsModule {}
