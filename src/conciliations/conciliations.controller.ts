import { Controller, Get, Param } from '@nestjs/common';
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
}