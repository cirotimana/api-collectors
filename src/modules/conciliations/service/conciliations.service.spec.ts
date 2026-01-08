import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationsService } from './conciliations.service';
import { ConciliationsRepository } from '../repository/conciliations.repository';
import { Conciliation } from '../entities/conciliation.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConciliationsService', () => {
  let service: ConciliationsService;
  let repository: jest.Mocked<ConciliationsRepository>;

  const mockRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCollector: jest.fn(),
    findByDateRange: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    getSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConciliationsService,
        {
          provide: ConciliationsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ConciliationsService>(ConciliationsService);
    repository = module.get(ConciliationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all conciliations', async () => {
      const conciliations: Conciliation[] = [
        { id: 1, collectorId: 1, amount: 1000.50 } as Conciliation,
        { id: 2, collectorId: 2, amount: 2000.75 } as Conciliation,
      ];

      repository.findAll.mockResolvedValue(conciliations);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(conciliations);
    });

    it('should return empty array when no conciliations found', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a conciliation by id', async () => {
      const conciliation: Conciliation = {
        id: 1,
        collectorId: 1,
        amount: 1000.50,
      } as Conciliation;

      repository.findOne.mockResolvedValue(conciliation);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(conciliation);
    });
  });

  describe('findByCollector', () => {
    it('should return conciliations by collector name', async () => {
      const conciliations: Conciliation[] = [
        { id: 1, collectorId: 1 } as Conciliation,
      ];

      repository.findByCollector.mockResolvedValue(conciliations);

      const result = await service.findByCollector('Collector1');

      expect(repository.findByCollector).toHaveBeenCalledWith('Collector1');
      expect(result).toEqual(conciliations);
    });
  });

  describe('findByDateRange', () => {
    it('should return conciliations by date range', async () => {
      const conciliations: Conciliation[] = [
        { id: 1, fromDate: new Date('2024-01-01'), toDate: new Date('2024-01-31') } as Conciliation,
      ];

      repository.findByDateRange.mockResolvedValue(conciliations);

      const result = await service.findByDateRange('2024-01-01', '2024-01-31');

      expect(repository.findByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(result).toEqual(conciliations);
    });
  });

  describe('remove', () => {
    it('should remove a conciliation successfully', async () => {
      repository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Conciliation 1 eliminada correctamente' });
    });

    it('should throw NotFoundException when conciliation not found', async () => {
      repository.remove.mockRejectedValue(new Error('Conciliation 999 no encontrada'));

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.remove).toHaveBeenCalledWith(999);
    });
  });

  describe('getStats', () => {
    it('should return stats for a collector', async () => {
      const expectedStats = {
        totalAmount: 5000.00,
        totalRecords: 100,
        averageAmount: 50.00,
      };

      repository.getStats.mockResolvedValue(expectedStats);

      const result = await service.getStats(1, '2024-01-01', '2024-01-31');

      expect(repository.getStats).toHaveBeenCalledWith(1, '2024-01-01', '2024-01-31');
      expect(result).toEqual(expectedStats);
    });

    it('should return stats without date range', async () => {
      const expectedStats = {
        totalAmount: 10000.00,
        totalRecords: 200,
      };

      repository.getStats.mockResolvedValue(expectedStats);

      const result = await service.getStats(1);

      expect(repository.getStats).toHaveBeenCalledWith(1, undefined, undefined);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getSummary', () => {
    it('should return summary for multiple collectors', async () => {
      const expectedSummary = {
        collectors: [
          { id: 1, totalAmount: 1000.00 },
          { id: 2, totalAmount: 2000.00 },
          { id: 3, totalAmount: 3000.00 },
        ],
        grandTotal: 6000.00,
      };

      repository.getSummary.mockResolvedValue(expectedSummary);

      const result = await service.getSummary([1, 2, 3], '2024-01-01', '2024-01-31');

      expect(repository.getSummary).toHaveBeenCalledWith([1, 2, 3], '2024-01-01', '2024-01-31');
      expect(result).toEqual(expectedSummary);
    });

    it('should return summary without date range', async () => {
      const expectedSummary = {
        collectors: [{ id: 1, totalAmount: 1000.00 }],
      };

      repository.getSummary.mockResolvedValue(expectedSummary);

      const result = await service.getSummary([1]);

      expect(repository.getSummary).toHaveBeenCalledWith([1], undefined, undefined);
      expect(result).toEqual(expectedSummary);
    });
  });
});
