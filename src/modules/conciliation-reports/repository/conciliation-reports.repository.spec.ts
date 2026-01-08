import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConciliationReportsRepository } from './conciliation-reports.repository';
import { CalimacoRecord } from '../../calimaco-records/entities/calimaco-record.entity';

describe('ConciliationReportsRepository', () => {
  let repository: ConciliationReportsRepository;
  let calimacoRecordRepository: jest.Mocked<Repository<CalimacoRecord>>;

  const mockRepository = () => ({
    query: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciliationReportsRepository,
        {
          provide: getRepositoryToken(CalimacoRecord),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ConciliationReportsRepository>(ConciliationReportsRepository);
    calimacoRecordRepository = module.get(getRepositoryToken(CalimacoRecord));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConciliacionCompletaPorDiaPaginated', () => {
    it('should return paginated conciliacion completa por dia', async () => {
      const collectorIds = [1, 2, 3];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = 1;
      const limit = 10;

      const mockData = [{ id: 1, date: '2024-01-01' }];
      const mockCount = [{ total: '10' }];

      calimacoRecordRepository.query
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockCount);

      const result = await repository.getConciliacionCompletaPorDiaPaginated(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(10);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
      expect(result.totalPages).toBe(1);
    });

    it('should adjust date format when time is not included', async () => {
      const collectorIds = [1];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = 1;
      const limit = 10;

      calimacoRecordRepository.query
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: '0' }]);

      await repository.getConciliacionCompletaPorDiaPaginated(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          collectorIds,
          '2024-01-01 00:00:00',
          '2024-01-31 23:59:59',
          limit,
          0,
        ]),
      );
    });
  });

  describe('getConciliados', () => {
    it('should return paginated conciliados', async () => {
      const collectorIds = [1, 2];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = 1;
      const limit = 20;

      const mockData = [{ id: 1, status: 'conciliado' }];
      const mockCount = [{ total: '5' }];

      calimacoRecordRepository.query
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockCount);

      const result = await repository.getConciliados(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(5);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
    });
  });

  describe('getNoConciliados', () => {
    it('should return paginated no conciliados', async () => {
      const collectorIds = [1];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = 2;
      const limit = 15;

      const mockData = [{ id: 1, status: 'no_conciliado' }];
      const mockCount = [{ total: '30' }];

      calimacoRecordRepository.query
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockCount);

      const result = await repository.getNoConciliados(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(30);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('getReporteVentasRecaudadores', () => {
    it('should return reporte ventas recaudadores with all parameters', async () => {
      const collectorIds = [1, 2, 3];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const page = 1;
      const limit = 10;

      const mockData = [{ collectorId: 1, total: 1000.50 }];
      const mockCount = [{ total: '1' }];

      calimacoRecordRepository.query
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockCount);

      const result = await repository.getReporteVentasRecaudadores(
        collectorIds,
        fromDate,
        toDate,
        page,
        limit,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });

    it('should return reporte with null parameters', async () => {
      const page = 1;
      const limit = 10;

      const mockData = [];
      const mockCount = [{ total: '0' }];

      calimacoRecordRepository.query
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockCount);

      const result = await repository.getReporteVentasRecaudadores(
        undefined,
        undefined,
        undefined,
        page,
        limit,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(0);
    });

    it('should handle empty collectorIds array', async () => {
      const collectorIds: number[] = [];
      const page = 1;
      const limit = 10;

      const mockData = [];
      const mockCount = [{ total: '0' }];

      calimacoRecordRepository.query
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(mockCount);

      const result = await repository.getReporteVentasRecaudadores(
        collectorIds,
        undefined,
        undefined,
        page,
        limit,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(2);
      expect(result.total).toBe(0);
    });
  });

  describe('getConciliacionCompletaAcumulado', () => {
    it('should return conciliacion completa acumulado with all parameters', async () => {
      const collectorIds = [1, 2];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';

      const mockData = [
        { collectorId: 1, total: 5000.00 },
        { collectorId: 2, total: 3000.00 },
      ];

      calimacoRecordRepository.query.mockResolvedValue(mockData);

      const result = await repository.getConciliacionCompletaAcumulado(
        collectorIds,
        fromDate,
        toDate,
      );

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('should use default values when parameters are not provided', async () => {
      const mockData = [{ collectorId: 1, total: 10000.00 }];

      calimacoRecordRepository.query.mockResolvedValue(mockData);

      const result = await repository.getConciliacionCompletaAcumulado();

      expect(calimacoRecordRepository.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('should adjust date format when time is not included', async () => {
      const collectorIds = [1];
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';

      calimacoRecordRepository.query.mockResolvedValue([]);

      await repository.getConciliacionCompletaAcumulado(collectorIds, fromDate, toDate);

      expect(calimacoRecordRepository.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          collectorIds,
          '2024-01-01 00:00:00',
          '2024-01-31 23:59:59',
        ]),
      );
    });
  });
});

