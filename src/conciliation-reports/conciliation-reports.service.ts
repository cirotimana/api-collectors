import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalimacoRecord } from '../entities/calimaco-record.entity';

@Injectable()
export class ConciliationReportsService {
  constructor(
    @InjectRepository(CalimacoRecord)
    private calimacoRecordRepository: Repository<CalimacoRecord>,
  ) {}

  async getConciliacionCompletaPorDia(
    collectorIds: number[],
    fromDate: string,
    toDate: string,
  ) {
    // Ajustar fechas para incluir todo el día si no tienen hora
    const adjustedFromDate = fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`;
    const adjustedToDate = toDate.includes(':') ? toDate : `${toDate} 23:59:59`;
    
    const query = `
      SELECT * FROM get_conciliacion_completa_por_dia($1, $2, $3)
    `;

    return await this.calimacoRecordRepository.query(query, [
      collectorIds,
      adjustedFromDate,
      adjustedToDate,
    ]);
  }

  async getConciliacionCompletaPorDiaPaginated(
    collectorIds: number[],
    fromDate: string,
    toDate: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Ajustar fechas para incluir todo el día si no tienen hora
    const adjustedFromDate = fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`;
    const adjustedToDate = toDate.includes(':') ? toDate : `${toDate} 23:59:59`;
    
    const query = `
      SELECT * FROM get_conciliacion_completa_por_dia($1, $2, $3)
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM get_conciliacion_completa_por_dia($1, $2, $3)
    `;

    const [data, countResult] = await Promise.all([
      this.calimacoRecordRepository.query(query, [
        collectorIds,
        adjustedFromDate,
        adjustedToDate,
        limit,
        (page - 1) * limit,
      ]),
      this.calimacoRecordRepository.query(countQuery, [
        collectorIds,
        adjustedFromDate,
        adjustedToDate,
      ])
    ]);

    const total = parseInt(countResult[0].total);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getConciliados(
    collectorIds: number[],
    fromDate: string,
    toDate: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Ajustar fechas para incluir todo el día si no tienen hora
    const adjustedFromDate = fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`;
    const adjustedToDate = toDate.includes(':') ? toDate : `${toDate} 23:59:59`;
    
    const query = `
      SELECT * FROM get_conciliados($1, $2, $3)
      ORDER BY calimaco_date DESC
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM get_conciliados($1, $2, $3)
    `;

    const [data, countResult] = await Promise.all([
      this.calimacoRecordRepository.query(query, [
        collectorIds,
        adjustedFromDate,
        adjustedToDate,
        limit,
        (page - 1) * limit,
      ]),
      this.calimacoRecordRepository.query(countQuery, [
        collectorIds,
        adjustedFromDate,
        adjustedToDate,
      ])
    ]);

    const total = parseInt(countResult[0].total);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getNoConciliados(
    collectorIds: number[],
    fromDate: string,
    toDate: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // Ajustar fechas para incluir todo el día si no tienen hora
    const adjustedFromDate = fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`;
    const adjustedToDate = toDate.includes(':') ? toDate : `${toDate} 23:59:59`;
    
    const query = `
      SELECT * FROM get_no_conciliados($1, $2, $3)
      ORDER BY record_date DESC
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM get_no_conciliados($1, $2, $3)
    `;

    const [data, countResult] = await Promise.all([
      this.calimacoRecordRepository.query(query, [
        collectorIds,
        adjustedFromDate,
        adjustedToDate,
        limit,
        (page - 1) * limit,
      ]),
      this.calimacoRecordRepository.query(countQuery, [
        collectorIds,
        adjustedFromDate,
        adjustedToDate,
      ])
    ]);

    const total = parseInt(countResult[0].total);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReporteVentasRecaudadores(
    collectorIds?: number[],
    fromDate?: string,
    toDate?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // preparar parametros - usar defaults de la funcion si estan vacios
    const params: any[] = [];
    
    // collectors: usar array vacio si no se proporciona para que la funcion use su default
    params.push(collectorIds && collectorIds.length > 0 ? collectorIds : null);
    
    // fechas: usar null si no se proporcionan para que la funcion use sus defaults
    if (fromDate) {
      params.push(fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`);
    } else {
      params.push(null);
    }
    
    if (toDate) {
      params.push(toDate.includes(':') ? toDate : `${toDate} 23:59:59`);
    } else {
      params.push(null);
    }
    
    const query = `
      SELECT * FROM get_reporte_ventas_recaudadores($1, $2, $3)
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM get_reporte_ventas_recaudadores($1, $2, $3)
    `;

    const [data, countResult] = await Promise.all([
      this.calimacoRecordRepository.query(query, [
        ...params,
        limit,
        (page - 1) * limit,
      ]),
      this.calimacoRecordRepository.query(countQuery, params)
    ]);

    const total = parseInt(countResult[0].total);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getConciliacionCompletaAcumulado(
    collectorIds?: number[],
    fromDate?: string,
    toDate?: string,
  ) {
    // Valores por defecto
    const defaultCollectorIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Usar valores por defecto si no se proporcionan
    const finalCollectorIds = collectorIds && collectorIds.length > 0 ? collectorIds : defaultCollectorIds;
    const finalFromDate = fromDate 
      ? (fromDate.includes(':') ? fromDate : `${fromDate} 00:00:00`)
      : `${currentDate} 00:00:00`;
    const finalToDate = toDate 
      ? (toDate.includes(':') ? toDate : `${toDate} 23:59:59`)
      : `${currentDate} 23:59:59`;
    
    const query = `
      SELECT * FROM get_conciliacion_completa_acumulado($1, $2, $3)
    `;

    return await this.calimacoRecordRepository.query(query, [
      finalCollectorIds,
      finalFromDate,
      finalToDate,
    ]);
  }
}