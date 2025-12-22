import { Controller, Get, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LiquidationsService } from './liquidations.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Liquidations')
@ApiBearerAuth()
@Controller('liquidations')
export class LiquidationsController {
  constructor(private readonly liquidationsService: LiquidationsService) {}

  @Get()
  findAll() {
    return this.liquidationsService.findAll();
  }

  @Get('stats')
  async getStats(
    @Query('collectorId') collectorId: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.liquidationsService.getStats(collectorId, fromDate, toDate);
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

      return this.liquidationsService.getSummary(ids, fromDate, toDate);
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
