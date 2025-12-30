import { Test, TestingModule } from '@nestjs/testing';
import { ConciliationsController } from './conciliations.controller';
import { ConciliationsService } from './service/conciliations.service';
import { Conciliation } from './entities/conciliation.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConciliationsController', () => {
  let controller: ConciliationsController;
  let service: jest.Mocked<ConciliationsService>;

  const mockConciliationsService = {
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
      controllers: [ConciliationsController],
      providers: [
        {
          provide: ConciliationsService,
          useValue: mockConciliationsService,
        },
      ],
    }).compile();

    controller = module.get<ConciliationsController>(ConciliationsController);
    service = module.get(ConciliationsService);
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

      service.findAll.mockResolvedValue(conciliations);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(conciliations);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no conciliations found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a conciliation by id', async () => {
      const conciliationId = '1';
      const expectedConciliation: Conciliation = {
        id: 1,
        collectorId: 1,
        amount: 1000.50,
        conciliationsType: 1,
      } as Conciliation;

      service.findOne.mockResolvedValue(expectedConciliation);

      const result = await controller.findOne(conciliationId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedConciliation);
    });

    it('should throw NotFoundException when conciliation not found', async () => {
      const conciliationId = '999';

      service.findOne.mockRejectedValue(
        new NotFoundException('Conciliation with ID 999 not found'),
      );

      await expect(controller.findOne(conciliationId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCollector', () => {
    it('should return conciliations by collector name', async () => {
      const collectorName = 'Collector1';
      const conciliations: Conciliation[] = [
        { id: 1, collectorId: 1 } as Conciliation,
      ];

      service.findByCollector.mockResolvedValue(conciliations);

      const result = await controller.findByCollector(collectorName);

      expect(service.findByCollector).toHaveBeenCalledWith(collectorName);
      expect(result).toEqual(conciliations);
    });
  });

  describe('findByDateRange', () => {
    it('should return conciliations by date range', async () => {
      const from = '2024-01-01';
      const to = '2024-01-31';
      const conciliations: Conciliation[] = [
        { id: 1, fromDate: new Date(from), toDate: new Date(to) } as Conciliation,
      ];

      service.findByDateRange.mockResolvedValue(conciliations);

      const result = await controller.findByDateRange(from, to);

      expect(service.findByDateRange).toHaveBeenCalledWith(from, to);
      expect(result).toEqual(conciliations);
    });
  });

  describe('getStats', () => {
    it('should return stats for a collector', async () => {
      const collectorId = 1;
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedStats = {
        totalAmount: 5000.00,
        totalRecords: 100,
        averageAmount: 50.00,
      };

      service.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats(collectorId, fromDate, toDate);

      expect(service.getStats).toHaveBeenCalledWith(collectorId, fromDate, toDate);
      expect(result).toEqual(expectedStats);
    });

    it('should return stats without date range', async () => {
      const collectorId = 1;
      const expectedStats = {
        totalAmount: 10000.00,
        totalRecords: 200,
      };

      service.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats(collectorId);

      expect(service.getStats).toHaveBeenCalledWith(collectorId, undefined, undefined);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getSummary', () => {
    it('should return summary for multiple collectors', async () => {
      const collectorIds = '1,2,3';
      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const expectedSummary = {
        collectors: [
          { id: 1, totalAmount: 1000.00 },
          { id: 2, totalAmount: 2000.00 },
          { id: 3, totalAmount: 3000.00 },
        ],
        grandTotal: 6000.00,
      };

      service.getSummary.mockResolvedValue(expectedSummary);

      const result = await controller.getSummary(collectorIds, fromDate, toDate);

      expect(service.getSummary).toHaveBeenCalledWith([1, 2, 3], fromDate, toDate);
      expect(result).toEqual(expectedSummary);
    });

    it('should return summary with default collector ids when not provided', async () => {
      const expectedSummary = {
        collectors: [
          { id: 1, totalAmount: 1000.00 },
          { id: 2, totalAmount: 2000.00 },
          { id: 3, totalAmount: 3000.00 },
        ],
      };

      service.getSummary.mockResolvedValue(expectedSummary);

      const result = await controller.getSummary();

      expect(service.getSummary).toHaveBeenCalledWith([1, 2, 3], undefined, undefined);
      expect(result).toEqual(expectedSummary);
    });
  });

  describe('remove', () => {
    it('should delete a conciliation successfully', async () => {
      const conciliationId = '1';
      const expectedMessage = { message: 'Conciliation 1 eliminada correctamente' };

      service.remove.mockResolvedValue(expectedMessage);

      const result = await controller.remove(conciliationId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedMessage);
    });

    it('should throw NotFoundException when conciliation not found', async () => {
      const conciliationId = '999';

      service.remove.mockRejectedValue(
        new NotFoundException('Conciliation 999 no encontrada'),
      );

      await expect(controller.remove(conciliationId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });
});
