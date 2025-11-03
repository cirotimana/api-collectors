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
  async getStats(
    @Query('collectorId') collectorId: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.conciliationsService.getStats(collectorId, fromDate, toDate);
  }

    @Get('summary')
  async getSummary(
    @Query('collectorIds') collectorIds?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const ids = collectorIds
        ? collectorIds.split(',').map((id) => Number(id)).filter((n) => !isNaN(n))
        : [1, 2, 3];

    return this.conciliationsService.getSummary(ids, fromDate, toDate);
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
