import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ConciliationsService } from './conciliations.service';

@Controller('conciliations')
export class ConciliationsController {
  constructor(private readonly conciliationsService: ConciliationsService) {}

  @Get()
  findAll() {
    return this.conciliationsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.conciliationsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conciliationsService.findOne(+id);
  }

  @Get('period/:period')
  findByPeriod(@Param('period') period: string) {
    return this.conciliationsService.findByPeriod(period);
  }

  @Get('collector/:collectorName')
  findByCollector(@Param('collectorName') collectorName: string) {
    return this.conciliationsService.findByCollector(collectorName);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conciliationsService.remove(+id);
  }
}