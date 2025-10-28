import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
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

  // nuevo endpoint: búsqueda por rango de fechas
  @Get('range')
  findByDateRange(@Query('from') from: string, @Query('to') to: string) {
    return this.liquidationsService.findByDateRange(from, to);
  }

  @Get('collector/:collectorName')
  findByCollector(@Param('collectorName') collectorName: string) {
    return this.liquidationsService.findByCollector(collectorName);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liquidationsService.remove(+id);
  }
}
