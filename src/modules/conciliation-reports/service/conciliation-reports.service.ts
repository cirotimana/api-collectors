import { Injectable } from '@nestjs/common';
import { PAGINATION } from '../../../common/constants/constants';
import { ConciliationReportsRepository } from '../repository/conciliation-reports.repository';

@Injectable()
export class ConciliationReportsService {
  constructor(
    private conciliationReportsRepository: ConciliationReportsRepository,
  ) {}

  async getConciliacionCompletaPorDiaPaginated(
    collectorIds: number[],
    fromDate: string,
    toDate: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ) {
    return await this.conciliationReportsRepository.getConciliacionCompletaPorDiaPaginated(
      collectorIds,
      fromDate,
      toDate,
      page,
      limit,
    );
  }

  async getConciliados(
    collectorIds: number[],
    fromDate: string,
    toDate: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ) {
    return await this.conciliationReportsRepository.getConciliados(
      collectorIds,
      fromDate,
      toDate,
      page,
      limit,
    );
  }

  async getNoConciliados(
    collectorIds: number[],
    fromDate: string,
    toDate: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ) {
    return await this.conciliationReportsRepository.getNoConciliados(
      collectorIds,
      fromDate,
      toDate,
      page,
      limit,
    );
  }

  async getReporteVentasRecaudadores(
    collectorIds?: number[],
    fromDate?: string,
    toDate?: string,
    page: number = PAGINATION.DEFAULT_PAGE,
    limit: number = PAGINATION.DEFAULT_LIMIT,
  ) {
    return await this.conciliationReportsRepository.getReporteVentasRecaudadores(
      collectorIds,
      fromDate,
      toDate,
      page,
      limit,
    );
  }

  async getConciliacionCompletaAcumulado(
    collectorIds?: number[],
    fromDate?: string,
    toDate?: string,
  ) {
    return await this.conciliationReportsRepository.getConciliacionCompletaAcumulado(
      collectorIds,
      fromDate,
      toDate,
    );
  }
}
