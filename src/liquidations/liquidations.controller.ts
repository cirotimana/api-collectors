import { Controller, Get, Param } from '@nestjs/common';
import { LiquidationsService } from './liquidations.service';

@Controller('liquidations')
export class LiquidationsController {
  constructor(private readonly liquidationsService: LiquidationsService) {}

  @Get()
  findAll() {
    return this.liquidationsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.liquidationsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liquidationsService.findOne(+id);
  }

  @Get('period/:period')
  findByPeriod(@Param('period') period: string) {
    return this.liquidationsService.findByPeriod(period);
  }
}