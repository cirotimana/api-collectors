import { Controller, Get, Param, Delete, Patch, Body } from '@nestjs/common';
import { ReconciliationDiscrepanciesService } from './reconciliation-discrepancies.service';

@Controller('reconciliation-discrepancies')
export class ReconciliationDiscrepanciesController {
  constructor(private readonly discrepanciesService: ReconciliationDiscrepanciesService) {}

  @Get()
  findAll() {
    return this.discrepanciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discrepanciesService.findOne(+id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string }, // Cambiado para recibir un objeto JSON
  ) {
    return this.discrepanciesService.updateStatus(+id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discrepanciesService.remove(+id);
  }
}