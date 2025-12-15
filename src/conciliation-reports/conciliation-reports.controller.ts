import { Controller, Post, Body, Query, Get, UseGuards } from '@nestjs/common';
import { ConciliationReportsService } from './conciliation-reports.service';
import { ConciliationReportDto } from './dto/conciliation-report.dto';
import { SalesReportDto } from './dto/sales-report.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Conciliation Reports')
@ApiBearerAuth()
@Controller('conciliation-reports')
export class ConciliationReportsController {
  constructor(
    private readonly conciliationReportsService: ConciliationReportsService,
  ) {}

  @Post('conciliacion-completa-por-dia')
  getConciliacionCompletaPorDia(@Body() reportDto: ConciliationReportDto) {
    return this.conciliationReportsService.getConciliacionCompletaPorDia(
      reportDto.collectorIds,
      reportDto.fromDate,
      reportDto.toDate,
    );
  }

  @Get('conciliacion-completa-por-dia')
  getConciliacionCompletaPorDiaQuery(
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
      page ? +page : 1,
      limit ? +limit : 50,
    );
  }

  @Post('conciliados')
  getConciliados(@Body() reportDto: ConciliationReportDto) {
    return this.conciliationReportsService.getConciliados(
      reportDto.collectorIds,
      reportDto.fromDate,
      reportDto.toDate,
    );
  }

  @Get('conciliados')
  getConciliadosQuery(
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
      page ? +page : 1,
      limit ? +limit : 50,
    );
  }

  @Post('no-conciliados')
  getNoConciliados(@Body() reportDto: ConciliationReportDto) {
    return this.conciliationReportsService.getNoConciliados(
      reportDto.collectorIds,
      reportDto.fromDate,
      reportDto.toDate,
    );
  }

  @Get('no-conciliados')
  getNoConciliadosQuery(
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
      page ? +page : 1,
      limit ? +limit : 50,
    );
  }

  @Post('reporte-ventas-recaudadores')
  getReporteVentasRecaudadores(@Body() reportDto: SalesReportDto) {
    return this.conciliationReportsService.getReporteVentasRecaudadores(
      reportDto.collectorIds,
      reportDto.fromDate,
      reportDto.toDate,
    );
  }

  @Get('reporte-ventas-recaudadores')
  getReporteVentasRecaudadoresQuery(
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
      page ? +page : 1,
      limit ? +limit : 50,
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