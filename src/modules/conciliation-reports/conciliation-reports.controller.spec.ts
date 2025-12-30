import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationReportsController } from './conciliation-reports.controller';
import { ConciliationReportsService } from './service/conciliation-reports.service';
import { PAGINATION } from '../../common/constants/constants';

describe('ConciliationReportsController', () => {
  let controller: ConciliationReportsController;
  let service: jest.Mocked<ConciliationReportsService>;

  const mockConciliationReportsService = {
    getConciliacionCompletaPorDiaPaginated: jest.fn(),
    getConciliados: jest.fn(),
    getNoConciliados: jest.fn(),
    getReporteVentasRecaudadores: jest.fn(),
    getConciliacionCompletaAcumulado: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConciliationReportsController],
      providers: [
        {
          provide: ConciliationReportsService,
          useValue: mockConciliationReportsService,
        },
      ],
    }).compile();

    controller = module.get<ConciliationReportsController>(ConciliationReportsController);
    service = module.get(ConciliationReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConciliacionCompletaPorDia', () => {
    it('should return paginated conciliacion completa por dia with default values', async () => {
      const collectorIds = '1,2,3';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = {
        data: [{ id: 1, date: '2024-01-01' }],
        total: 10,
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        totalPages: 1,
      };

      service.getConciliacionCompletaPorDiaPaginated.mockResolvedValue(expectedResult);

      const result = await controller.getConciliacionCompletaPorDia(
        collectorIds,
        fromDate,
        toDate,
      );

      expect(service.getConciliacionCompletaPorDiaPaginated).toHaveBeenCalledWith(
        [1, 2, 3],
        fromDate,
        toDate,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated results with custom page and limit', async () => {
      const collectorIds = '1,2';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = '2';
      const limit = '20';
      const expectedResult = {
        data: [{ id: 2, date: '2024-01-02' }],
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      };

      service.getConciliacionCompletaPorDiaPaginated.mockResolvedValue(expectedResult);

      const result = await controller.getConciliacionCompletaPorDia(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(service.getConciliacionCompletaPorDiaPaginated).toHaveBeenCalledWith(
        [1, 2],
        fromDate,
        toDate,
        2,
        20,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getConciliados', () => {
    it('should return paginated conciliados with default values', async () => {
      const collectorIds = '1,2,3';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = {
        data: [{ id: 1, status: 'conciliado' }],
        total: 5,
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        totalPages: 1,
      };

      service.getConciliados.mockResolvedValue(expectedResult);

      const result = await controller.getConciliados(
        collectorIds,
        fromDate,
        toDate,
      );

      expect(service.getConciliados).toHaveBeenCalledWith(
        [1, 2, 3],
        fromDate,
        toDate,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated results with custom parameters', async () => {
      const collectorIds = '1';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = '3';
      const limit = '15';
      const expectedResult = {
        data: [{ id: 3 }],
        total: 30,
        page: 3,
        limit: 15,
        totalPages: 2,
      };

      service.getConciliados.mockResolvedValue(expectedResult);

      const result = await controller.getConciliados(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(service.getConciliados).toHaveBeenCalledWith(
        [1],
        fromDate,
        toDate,
        3,
        15,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getNoConciliados', () => {
    it('should return paginated no conciliados with default values', async () => {
      const collectorIds = '1,2';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = {
        data: [{ id: 1, status: 'no_conciliado' }],
        total: 8,
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        totalPages: 1,
      };

      service.getNoConciliados.mockResolvedValue(expectedResult);

      const result = await controller.getNoConciliados(
        collectorIds,
        fromDate,
        toDate,
      );

      expect(service.getNoConciliados).toHaveBeenCalledWith(
        [1, 2],
        fromDate,
        toDate,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getReporteVentasRecaudadores', () => {
    it('should return reporte ventas recaudadores with default values', async () => {
      const expectedResult = {
        data: [{ collectorId: 1, total: 1000.50 }],
        total: 1,
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        totalPages: 1,
      };

      service.getReporteVentasRecaudadores.mockResolvedValue(expectedResult);

      const result = await controller.getReporteVentasRecaudadores();

      expect(service.getReporteVentasRecaudadores).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return reporte with all parameters', async () => {
      const collectorIds = '1,2,3';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = '2';
      const limit = '25';
      const expectedResult = {
        data: [{ collectorId: 1, total: 5000.00 }],
        total: 10,
        page: 2,
        limit: 25,
        totalPages: 1,
      };

      service.getReporteVentasRecaudadores.mockResolvedValue(expectedResult);

      const result = await controller.getReporteVentasRecaudadores(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(service.getReporteVentasRecaudadores).toHaveBeenCalledWith(
        [1, 2, 3],
        fromDate,
        toDate,
        2,
        25,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getConciliacionCompletaAcumulado', () => {
    it('should return conciliacion completa acumulado without parameters', async () => {
      const expectedResult = [
        { collectorId: 1, total: 10000.00 },
        { collectorId: 2, total: 20000.00 },
      ];

      service.getConciliacionCompletaAcumulado.mockResolvedValue(expectedResult);

      const result = await controller.getConciliacionCompletaAcumulado();

      expect(service.getConciliacionCompletaAcumulado).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return conciliacion completa acumulado with all parameters', async () => {
      const collectorIds = '1,2';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = [
        { collectorId: 1, total: 5000.00 },
      ];

      service.getConciliacionCompletaAcumulado.mockResolvedValue(expectedResult);

      const result = await controller.getConciliacionCompletaAcumulado(
        collectorIds,
        fromDate,
        toDate,
      );

      expect(service.getConciliacionCompletaAcumulado).toHaveBeenCalledWith(
        [1, 2],
        fromDate,
        toDate,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});

