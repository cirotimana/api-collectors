import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReconciliationDiscrepanciesRepository } from './reconciliation-discrepancies.repository';
import { ReconciliationDiscrepancy } from '../entities/reconciliation-discrepancies.entity';

describe('ReconciliationDiscrepanciesRepository', () => {
  let repository: ReconciliationDiscrepanciesRepository;
  let discrepancyRepository: jest.Mocked<Repository<ReconciliationDiscrepancy>>;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReconciliationDiscrepanciesRepository,
        {
          provide: getRepositoryToken(ReconciliationDiscrepancy),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ReconciliationDiscrepanciesRepository>(ReconciliationDiscrepanciesRepository);
    discrepancyRepository = module.get(getRepositoryToken(ReconciliationDiscrepancy));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all discrepancies with relations', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        {
          id: 1,
          status: 'new',
          methodProcess: 'conciliation',
        } as ReconciliationDiscrepancy,
      ];

      discrepancyRepository.find.mockResolvedValue(discrepancies);

      const result = await repository.findAll();

      expect(discrepancyRepository.find).toHaveBeenCalledWith({
        relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(discrepancies);
    });

    it('should return empty array when no discrepancies found', async () => {
      discrepancyRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a discrepancy by id with relations', async () => {
      const discrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'new',
        methodProcess: 'conciliation',
      } as ReconciliationDiscrepancy;

      discrepancyRepository.findOne.mockResolvedValue(discrepancy);

      const result = await repository.findOne(1);

      expect(discrepancyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
      });
      expect(result).toEqual(discrepancy);
    });

    it('should return null when discrepancy not found', async () => {
      discrepancyRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findOneWithoutRelations', () => {
    it('should return a discrepancy by id without relations', async () => {
      const discrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'new',
      } as ReconciliationDiscrepancy;

      discrepancyRepository.findOne.mockResolvedValue(discrepancy);

      const result = await repository.findOneWithoutRelations(1);

      expect(discrepancyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(discrepancy);
    });
  });

  describe('updateStatus', () => {
    it('should update discrepancy status', async () => {
      discrepancyRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.updateStatus(1, 'processed');

      expect(discrepancyRepository.update).toHaveBeenCalledWith(1, { status: 'processed' });
      expect(discrepancyRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle update with no affected rows', async () => {
      discrepancyRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.updateStatus(999, 'processed');

      expect(discrepancyRepository.update).toHaveBeenCalledWith(999, { status: 'processed' });
    });
  });

  describe('save', () => {
    it('should save a discrepancy', async () => {
      const discrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'new',
      } as ReconciliationDiscrepancy;

      discrepancyRepository.save.mockResolvedValue(discrepancy);

      const result = await repository.save(discrepancy);

      expect(discrepancyRepository.save).toHaveBeenCalledWith(discrepancy);
      expect(result).toEqual(discrepancy);
    });
  });

  describe('findByStatus', () => {
    it('should return discrepancies by status', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        {
          id: 1,
          status: 'new',
          methodProcess: 'conciliation',
        } as ReconciliationDiscrepancy,
      ];

      discrepancyRepository.find.mockResolvedValue(discrepancies);

      const result = await repository.findByStatus('new');

      expect(discrepancyRepository.find).toHaveBeenCalledWith({
        where: { status: 'new' },
        relations: ['liquidation', 'liquidation.collector', 'conciliation', 'conciliation.collector'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(discrepancies);
    });
  });

  describe('remove', () => {
    it('should remove a discrepancy', async () => {
      const discrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'new',
      } as ReconciliationDiscrepancy;

      discrepancyRepository.findOne.mockResolvedValue(discrepancy);
      discrepancyRepository.remove.mockResolvedValue(discrepancy);

      await repository.remove(1);

      expect(discrepancyRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(discrepancyRepository.remove).toHaveBeenCalledWith(discrepancy);
    });

    it('should throw error when discrepancy not found', async () => {
      discrepancyRepository.findOne.mockResolvedValue(null);

      await expect(repository.remove(999)).rejects.toThrow();
      expect(discrepancyRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });
});

