import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
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


  // nuevo endpoint: buscar por rango de fechas
  @Get('range')
  findByDateRange(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.conciliationsService.findByDateRange(from, to);
  }

  
  @Get('collector/:collectorName')
  findByCollector(@Param('collectorName') collectorName: string) {
    return this.conciliationsService.findByCollector(collectorName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conciliationsService.findOne(+id);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conciliationsService.remove(+id);
  }
}
