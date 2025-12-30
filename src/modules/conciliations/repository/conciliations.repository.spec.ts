import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConciliationsRepository } from './conciliations.repository';
import { Conciliation } from '../entities/conciliation.entity';

describe('ConciliationsRepository', () => {
  let repository: ConciliationsRepository;
  let conciliationRepository: jest.Mocked<Repository<Conciliation>>;

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
        ConciliationsRepository,
        {
          provide: getRepositoryToken(Conciliation),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ConciliationsRepository>(ConciliationsRepository);
    conciliationRepository = module.get(getRepositoryToken(Conciliation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all conciliations with relations', async () => {
      const conciliations: Conciliation[] = [
        { id: 1, collectorId: 1, amount: 1000.50 } as Conciliation,
        { id: 2, collectorId: 2, amount: 2000.75 } as Conciliation,
      ];

      conciliationRepository.find.mockResolvedValue(conciliations);

      const result = await repository.findAll();

      expect(conciliationRepository.find).toHaveBeenCalledWith({
        relations: ['collector', 'createdBy', 'files'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(conciliations);
    });

    it('should return empty array when no conciliations found', async () => {
      conciliationRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a conciliation by id with relations', async () => {
      const conciliation: Conciliation = {
        id: 1,
        collectorId: 1,
        amount: 1000.50,
      } as Conciliation;

      conciliationRepository.findOne.mockResolvedValue(conciliation);

      const result = await repository.findOne(1);

      expect(conciliationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector', 'createdBy', 'files'],
      });
      expect(result).toEqual(conciliation);
    });

    it('should return null when conciliation not found', async () => {
      conciliationRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByCollector', () => {
    it('should return conciliations by collector name', async () => {
      const conciliations: Conciliation[] = [
        { id: 1, collectorId: 1 } as Conciliation,
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(conciliations),
      } as unknown as SelectQueryBuilder<Conciliation>;

      conciliationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByCollector('Collector1');

      expect(conciliationRepository.createQueryBuilder).toHaveBeenCalledWith('c');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual(conciliations);
    });
  });

  describe('findByDateRange', () => {
    it('should return conciliations by date range', async () => {
      const conciliations: Conciliation[] = [
        { id: 1, fromDate: new Date('2024-01-01'), toDate: new Date('2024-01-31') } as Conciliation,
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(conciliations),
      } as unknown as SelectQueryBuilder<Conciliation>;

      conciliationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByDateRange('2024-01-01', '2024-01-31');

      expect(conciliationRepository.createQueryBuilder).toHaveBeenCalledWith('conciliation');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual(conciliations);
    });
  });

  describe('remove', () => {
    it('should remove a conciliation', async () => {
      const conciliation: Conciliation = {
        id: 1,
        collectorId: 1,
      } as Conciliation;

      conciliationRepository.findOne.mockResolvedValue(conciliation);
      conciliationRepository.remove.mockResolvedValue(conciliation);

      await repository.remove(1);

      expect(conciliationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(conciliationRepository.remove).toHaveBeenCalledWith(conciliation);
    });

    it('should throw error when conciliation not found', async () => {
      conciliationRepository.findOne.mockResolvedValue(null);

      await expect(repository.remove(999)).rejects.toThrow();
      expect(conciliationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('getStats', () => {
    it('should return stats for a collector', async () => {
      const mockResult = {
        total_amount: '5000.00',
        total_amount_collector: '4500.00',
      };

      conciliationRepository.query.mockResolvedValue([mockResult]);

      const result = await repository.getStats(1, '2024-01-01', '2024-01-31');

      expect(conciliationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_conciliations_summary'),
        [1, '2024-01-01', '2024-01-31'],
      );
      expect(result).toBeDefined();
      expect(result.totalAmount).toBe(5000.00);
      expect(result.totalAmountCollector).toBe(4500.00);
    });

    it('should return stats with null dates', async () => {
      const mockResult = {
        total_amount: '10000.00',
        total_amount_collector: '9000.00',
      };

      conciliationRepository.query.mockResolvedValue([mockResult]);

      const result = await repository.getStats(1);

      expect(conciliationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_conciliations_summary'),
        [1, null, null],
      );
      expect(result.totalAmount).toBe(10000.00);
    });
  });

  describe('getSummary', () => {
    it('should return summary for multiple collectors', async () => {
      const mockResult = [
        { collectorId: 1, totalAmount: '1000.00' },
        { collectorId: 2, totalAmount: '2000.00' },
      ];

      conciliationRepository.query.mockResolvedValue(mockResult);

      const result = await repository.getSummary([1, 2], '2024-01-01', '2024-01-31');

      expect(conciliationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_conciliations_summary_by_day'),
        [[1, 2], '2024-01-01', '2024-01-31'],
      );
      expect(result).toEqual(mockResult);
    });

    it('should return summary with null dates', async () => {
      const mockResult = [{ collectorId: 1, totalAmount: '5000.00' }];

      conciliationRepository.query.mockResolvedValue(mockResult);

      const result = await repository.getSummary([1, 2]);

      expect(conciliationRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('get_conciliations_summary_by_day'),
        [[1, 2], null, null],
      );
      expect(result).toEqual(mockResult);
    });
  });
});

