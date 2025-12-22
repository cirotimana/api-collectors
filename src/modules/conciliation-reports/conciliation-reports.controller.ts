import { Controller, Post, Body, Query, Get, UseGuards } from '@nestjs/common';
import { ConciliationReportsService } from './conciliation-reports.service';
import { ConciliationReportDto } from './dto/conciliation-report.dto';
import { SalesReportDto } from './dto/sales-report.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PAGINATION } from '../../common/constants/constants';

@ApiTags('Conciliation Reports')
@ApiBearerAuth()
@Controller('conciliation-reports')
export class ConciliationReportsController {
  constructor(
    private readonly conciliationReportsService: ConciliationReportsService,
  ) {}



  @Get('conciliacion-completa-por-dia')
  getConciliacionCompletaPorDia(
    @Query('collectorIds') collectorIds: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const ids = collectorIds.split(',').map(id => parseInt(id.trim()));
    return this.conciliationReportsService.getConciliacionCompletaPorDiaPaginated(
      ids,
      fromDate,
      toDate,
      page ? +page : PAGINATION.DEFAULT_PAGE,
      limit ? +limit : PAGINATION.DEFAULT_LIMIT,
    );
  }



  @Get('conciliados')
  getConciliados(
    @Query('collectorIds') collectorIds: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const ids = collectorIds.split(',').map(id => parseInt(id.trim()));
    return this.conciliationReportsService.getConciliados(
      ids,
      fromDate,
      toDate,
      page ? +page : PAGINATION.DEFAULT_PAGE,
      limit ? +limit : PAGINATION.DEFAULT_LIMIT,
    );
  }



  @Get('no-conciliados')
  getNoConciliados(
    @Query('collectorIds') collectorIds: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const ids = collectorIds.split(',').map(id => parseInt(id.trim()));
    return this.conciliationReportsService.getNoConciliados(
      ids,
      fromDate,
      toDate,
      page ? +page : PAGINATION.DEFAULT_PAGE,
      limit ? +limit : PAGINATION.DEFAULT_LIMIT,
    );
  }



  @Get('reporte-ventas-recaudadores')
  getReporteVentasRecaudadores(
    @Query('collectorIds') collectorIds?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const ids = collectorIds ? collectorIds.split(',').map(id => parseInt(id.trim())) : undefined;
    return this.conciliationReportsService.getReporteVentasRecaudadores(
      ids,
      fromDate,
      toDate,
      page ? +page : PAGINATION.DEFAULT_PAGE,
      limit ? +limit : PAGINATION.DEFAULT_LIMIT,
    );
  }

  @Get('conciliacion-completa-acumulado')
  getConciliacionCompletaAcumulado(
    @Query('collectorIds') collectorIds?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const ids = collectorIds ? collectorIds.split(',').map(id => parseInt(id.trim())) : undefined;
    return this.conciliationReportsService.getConciliacionCompletaAcumulado(
      ids,
      fromDate,
      toDate,
    );
  }
}
