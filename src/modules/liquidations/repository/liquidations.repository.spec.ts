import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LiquidationsRepository } from './liquidations.repository';
import { Liquidation } from '../entities/liquidation.entity';

describe('LiquidationsRepository', () => {
  let repository: LiquidationsRepository;
  let liquidationRepository: jest.Mocked<Repository<Liquidation>>;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    query: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiquidationsRepository,
        {
          provide: getRepositoryToken(Liquidation),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<LiquidationsRepository>(LiquidationsRepository);
    liquidationRepository = module.get(getRepositoryToken(Liquidation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all liquidations with relations', async () => {
      const liquidations: Liquidation[] = [
        { id: 1, collectorId: 1, amountCollector: 1000.50 } as Liquidation,
        { id: 2, collectorId: 2, amountCollector: 2000.75 } as Liquidation,
      ];

      liquidationRepository.find.mockResolvedValue(liquidations);

      const result = await repository.findAll();

      expect(liquidationRepository.find).toHaveBeenCalledWith({
        relations: ['collector', 'createdBy', 'files'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(liquidations);
    });

    it('should return empty array when no liquidations found', async () => {
      liquidationRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a liquidation by id with relations', async () => {
      const liquidation: Liquidation = {
        id: 1,
        collectorId: 1,
        amountCollector: 1000.50,
      } as Liquidation;

      liquidationRepository.findOne.mockResolvedValue(liquidation);

      const result = await repository.findOne(1);

      expect(liquidationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector', 'createdBy', 'files'],
      });
      expect(result).toEqual(liquidation);
    });

    it('should return null when liquidation not found', async () => {
      liquidationRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByCollector', () => {
    it('should return liquidations by collector name', async () => {
      const liquidations: Liquidation[] = [
        { id: 1, collectorId: 1 } as Liquidation,
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(liquidations),
      } as unknown as SelectQueryBuilder<Liquidation>;

      liquidationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByCollector('Collector1');

      expect(liquidationRepository.createQueryBuilder).toHaveBeenCalledWith('l');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual(liquidations);
    });
  });

  describe('findByDateRange', () => {
    it('should return liquidations by date range', async () => {
      const liquidations: Liquidation[] = [
        { id: 1, fromDate: new Date('2024-01-01'), toDate: new Date('2024-01-31') } as Liquidation,
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(liquidations),
      } as unknown as SelectQueryBuilder<Liquidation>;

      liquidationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByDateRange('2024-01-01', '2024-01-31');

      expect(liquidationRepository.createQueryBuilder).toHaveBeenCalledWith('liquidation');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual(liquidations);
    });
  });

  describe('remove', () => {
    it('should remove a liquidation', async () => {
      const liquidation: Liquidation = {
        id: 1,
        collectorId: 1,
      } as Liquidation;

      liquidationRepository.findOne.mockResolvedValue(liquidation);
      liquidationRepository.remove.mockResolvedValue(liquidation);

      await repository.remove(1);

      expect(liquidationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(liquidationRepository.remove).toHaveBeenCalledWith(liquidation);
    });

    it('should throw error when liquidation not found', async () => {
      liquidationRepository.findOne.mockResolvedValue(null);

      await expect(repository.remove(999)).rejects.toThrow();
      expect(liquidationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('getStats', () => {
    it('should return stats for a collector', async () => {
      const mockResult = {
        total_amount_collector: '5000.00',
        total_amount_liquidation: '4800.00',
      };

      liquidationRepository.query.mockResolvedValue([mockResult]);

      const result = await repository.getStats(1, '2024-01-01', '2024-01-31');

      expect(liquidationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_liquidations_summary'),
        [1, '2024-01-01', '2024-01-31'],
      );
      expect(result).toBeDefined();
      expect(result.totalAmountCollector).toBe(5000.00);
      expect(result.totalAmountLiquidation).toBe(4800.00);
    });

    it('should return stats with null dates', async () => {
      const mockResult = {
        total_amount_collector: '10000.00',
        total_amount_liquidation: '9500.00',
      };

      liquidationRepository.query.mockResolvedValue([mockResult]);

      const result = await repository.getStats(1);

      expect(liquidationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_liquidations_summary'),
        [1, null, null],
      );
      expect(result.totalAmountCollector).toBe(10000.00);
    });
  });

  describe('getSummary', () => {
    it('should return summary for multiple collectors', async () => {
      const mockResult = [
        { collectorId: 1, totalAmount: '1000.00' },
        { collectorId: 2, totalAmount: '2000.00' },
      ];

      liquidationRepository.query.mockResolvedValue(mockResult);

      const result = await repository.getSummary([1, 2], '2024-01-01', '2024-01-31');

      expect(liquidationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_liquidations_summary_by_day'),
        [[1, 2], '2024-01-01', '2024-01-31'],
      );
      expect(result).toEqual(mockResult);
    });

    it('should return summary with null dates', async () => {
      const mockResult = [{ collectorId: 1, totalAmount: '5000.00' }];

      liquidationRepository.query.mockResolvedValue(mockResult);

      const result = await repository.getSummary([1, 2]);

      expect(liquidationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_liquidations_summary_by_day'),
        [[1, 2], null, null],
      );
      expect(result).toEqual(mockResult);
    });
  });
});

