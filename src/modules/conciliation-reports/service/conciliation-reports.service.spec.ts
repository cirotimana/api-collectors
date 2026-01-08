import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationReportsService } from './conciliation-reports.service';
import { ConciliationReportsRepository } from '../repository/conciliation-reports.repository';
import { PAGINATION } from '../../../common/constants/constants';

describe('ConciliationReportsService', () => {
  let service: ConciliationReportsService;
  let repository: jest.Mocked<ConciliationReportsRepository>;

  const mockRepository = {
    getConciliacionCompletaPorDiaPaginated: jest.fn(),
    getConciliados: jest.fn(),
    getNoConciliados: jest.fn(),
    getReporteVentasRecaudadores: jest.fn(),
    getConciliacionCompletaAcumulado: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciliationReportsService,
        {
          provide: ConciliationReportsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConciliationReportsService>(ConciliationReportsService);
    repository = module.get(ConciliationReportsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConciliacionCompletaPorDiaPaginated', () => {
    it('should return paginated conciliacion completa por dia with default values', async () => {
      const collectorIds = [1, 2, 3];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = {
        data: [{ id: 1, date: '2024-01-01' }],
        total: 10,
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        totalPages: 1,
      };

      repository.getConciliacionCompletaPorDiaPaginated.mockResolvedValue(expectedResult);

      const result = await service.getConciliacionCompletaPorDiaPaginated(
        collectorIds,
        fromDate,
        toDate,
      );

      expect(repository.getConciliacionCompletaPorDiaPaginated).toHaveBeenCalledWith(
        collectorIds,
        fromDate,
        toDate,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated results with custom page and limit', async () => {
      const collectorIds = [1, 2];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = 2;
      const limit = 20;
      const expectedResult = {
        data: [{ id: 2 }],
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      };

      repository.getConciliacionCompletaPorDiaPaginated.mockResolvedValue(expectedResult);

      const result = await service.getConciliacionCompletaPorDiaPaginated(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(repository.getConciliacionCompletaPorDiaPaginated).toHaveBeenCalledWith(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getConciliados', () => {
    it('should return paginated conciliados', async () => {
      const collectorIds = [1, 2, 3];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = {
        data: [{ id: 1 }],
        total: 5,
        page: 1,
        limit: 50,
        totalPages: 1,
      };

      repository.getConciliados.mockResolvedValue(expectedResult);

      const result = await service.getConciliados(collectorIds, fromDate, toDate);

      expect(repository.getConciliados).toHaveBeenCalledWith(
        collectorIds,
        fromDate,
        toDate,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getNoConciliados', () => {
    it('should return paginated no conciliados', async () => {
      const collectorIds = [1, 2];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = {
        data: [{ id: 1 }],
        total: 8,
        page: 1,
        limit: 50,
        totalPages: 1,
      };

      repository.getNoConciliados.mockResolvedValue(expectedResult);

      const result = await service.getNoConciliados(collectorIds, fromDate, toDate);

      expect(repository.getNoConciliados).toHaveBeenCalledWith(
        collectorIds,
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

      repository.getReporteVentasRecaudadores.mockResolvedValue(expectedResult);

      const result = await service.getReporteVentasRecaudadores();

      expect(repository.getReporteVentasRecaudadores).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return reporte with all parameters', async () => {
      const collectorIds = [1, 2, 3];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = 2;
      const limit = 25;
      const expectedResult = {
        data: [{ collectorId: 1 }],
        total: 10,
        page: 2,
        limit: 25,
        totalPages: 1,
      };

      repository.getReporteVentasRecaudadores.mockResolvedValue(expectedResult);

      const result = await service.getReporteVentasRecaudadores(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(repository.getReporteVentasRecaudadores).toHaveBeenCalledWith(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
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

      repository.getConciliacionCompletaAcumulado.mockResolvedValue(expectedResult);

      const result = await service.getConciliacionCompletaAcumulado();

      expect(repository.getConciliacionCompletaAcumulado).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return conciliacion completa acumulado with all parameters', async () => {
      const collectorIds = [1, 2];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedResult = [
        { collectorId: 1, total: 5000.00 },
      ];

      repository.getConciliacionCompletaAcumulado.mockResolvedValue(expectedResult);

      const result = await service.getConciliacionCompletaAcumulado(
        collectorIds,
        fromDate,
        toDate,
      );

      expect(repository.getConciliacionCompletaAcumulado).toHaveBeenCalledWith(
        collectorIds,
        fromDate,
        toDate,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});

