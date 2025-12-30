import { Test, TestingModule } from '@nestjs/testing';
import { LiquidationsController } from './liquidations.controller';
import { LiquidationsService } from './service/liquidations.service';
import { Liquidation } from './entities/liquidation.entity';
import { NotFoundException } from '@nestjs/common';

describe('LiquidationsController', () => {
  let controller: LiquidationsController;
  let service: jest.Mocked<LiquidationsService>;

  const mockLiquidationsService = {
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
      controllers: [LiquidationsController],
      providers: [
        {
          provide: LiquidationsService,
          useValue: mockLiquidationsService,
        },
      ],
    }).compile();

    controller = module.get<LiquidationsController>(LiquidationsController);
    service = module.get(LiquidationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all liquidations', async () => {
      const liquidations: Liquidation[] = [
        { id: 1, collectorId: 1, amountCollector: 1000.50 } as Liquidation,
        { id: 2, collectorId: 2, amountCollector: 2000.75 } as Liquidation,
      ];

      service.findAll.mockResolvedValue(liquidations);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(liquidations);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no liquidations found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a liquidation by id', async () => {
      const liquidationId = '1';
      const expectedLiquidation: Liquidation = {
        id: 1,
        collectorId: 1,
        amountCollector: 1000.50,
        liquidationsType: 1,
      } as Liquidation;

      service.findOne.mockResolvedValue(expectedLiquidation);

      const result = await controller.findOne(liquidationId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedLiquidation);
    });

    it('should throw NotFoundException when liquidation not found', async () => {
      const liquidationId = '999';

      service.findOne.mockRejectedValue(
        new NotFoundException('Liquidation with ID 999 not found'),
      );

      await expect(controller.findOne(liquidationId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCollector', () => {
    it('should return liquidations by collector name', async () => {
      const collectorName = 'Collector1';
      const liquidations: Liquidation[] = [
        { id: 1, collectorId: 1 } as Liquidation,
      ];

      service.findByCollector.mockResolvedValue(liquidations);

      const result = await controller.findByCollector(collectorName);

      expect(service.findByCollector).toHaveBeenCalledWith(collectorName);
      expect(result).toEqual(liquidations);
    });
  });

  describe('findByDateRange', () => {
    it('should return liquidations by date range', async () => {
      const from = '2024-01-01';
      const to = '2024-01-31';
      const liquidations: Liquidation[] = [
        { id: 1, fromDate: new Date(from), toDate: new Date(to) } as Liquidation,
      ];

      service.findByDateRange.mockResolvedValue(liquidations);

      const result = await controller.findByDateRange(from, to);

      expect(service.findByDateRange).toHaveBeenCalledWith(from, to);
      expect(result).toEqual(liquidations);
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
    it('should delete a liquidation successfully', async () => {
      const liquidationId = '1';
      const expectedMessage = { message: 'Liquidation 1 eliminada correctamente' };

      service.remove.mockResolvedValue(expectedMessage);

      const result = await controller.remove(liquidationId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedMessage);
    });

    it('should throw NotFoundException when liquidation not found', async () => {
      const liquidationId = '999';

      service.remove.mockRejectedValue(
        new NotFoundException('Liquidation 999 no encontrada'),
      );

      await expect(controller.remove(liquidationId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });
});
