import { Test, TestingModule } from '@nestjs/testing';
import { ReconciliationDiscrepanciesService } from './reconciliation-discrepancies.service';
import { ReconciliationDiscrepanciesRepository } from '../repository/reconciliation-discrepancies.repository';
import { ReconciliationDiscrepancy } from '../entities/reconciliation-discrepancies.entity';
import { NotFoundException } from '@nestjs/common';

describe('ReconciliationDiscrepanciesService', () => {
  let service: ReconciliationDiscrepanciesService;
  let repository: jest.Mocked<ReconciliationDiscrepanciesRepository>;

  const mockRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneWithoutRelations: jest.fn(),
    updateStatus: jest.fn(),
    save: jest.fn(),
    findByStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReconciliationDiscrepanciesService,
        {
          provide: ReconciliationDiscrepanciesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReconciliationDiscrepanciesService>(ReconciliationDiscrepanciesService);
    repository = module.get(ReconciliationDiscrepanciesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all discrepancies with dynamic relations loaded', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        {
          id: 1,
          status: 'new',
          methodProcess: 'conciliation',
          conciliation: { id: 1 } as any,
          liquidation: null,
        } as ReconciliationDiscrepancy,
        {
          id: 2,
          status: 'processed',
          methodProcess: 'liquidation',
          conciliation: null,
          liquidation: { id: 1 } as any,
        } as ReconciliationDiscrepancy,
      ];

      repository.findAll.mockResolvedValue(discrepancies);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0].liquidation).toBeNull();
      expect(result[1].conciliation).toBeNull();
    });

    it('should handle discrepancies with ambiguous methodProcess', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        {
          id: 3,
          status: 'new',
          methodProcess: 'unknown',
          conciliation: { id: 1 } as any,
          liquidation: { id: 1 } as any,
        } as ReconciliationDiscrepancy,
      ];

      repository.findAll.mockResolvedValue(discrepancies);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].liquidation).toBeNull();
      expect(result[0].conciliation).toBeNull();
    });

    it('should handle discrepancies with null methodProcess', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        {
          id: 4,
          status: 'new',
          methodProcess: null,
          conciliation: { id: 1 } as any,
          liquidation: { id: 1 } as any,
        } as ReconciliationDiscrepancy,
      ];

      repository.findAll.mockResolvedValue(discrepancies);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].liquidation).toBeNull();
      expect(result[0].conciliation).toBeNull();
    });

    it('should handle null discrepancies in array', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        null as any,
        {
          id: 1,
          status: 'new',
          methodProcess: 'conciliation',
        } as ReconciliationDiscrepancy,
      ];

      repository.findAll.mockResolvedValue(discrepancies);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      repository.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database error');
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a discrepancy by id with dynamic relations', async () => {
      const discrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'new',
        methodProcess: 'conciliation',
        conciliation: { id: 1 } as any,
        liquidation: { id: 1 } as any,
      } as ReconciliationDiscrepancy;

      repository.findOne.mockResolvedValue(discrepancy);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when discrepancy not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('updateStatus', () => {
    it('should update discrepancy status successfully', async () => {
      const discrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'new',
        methodProcess: 'conciliation',
      } as ReconciliationDiscrepancy;

      const updatedDiscrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'processed',
        methodProcess: 'conciliation',
        conciliation: { id: 1 } as any,
        liquidation: null,
      } as ReconciliationDiscrepancy;

      repository.findOneWithoutRelations.mockResolvedValue(discrepancy);
      repository.save.mockResolvedValue(discrepancy);
      repository.findOne.mockResolvedValue(updatedDiscrepancy);

      const result = await service.updateStatus(1, 'processed');

      expect(repository.findOneWithoutRelations).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalled();
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result.status).toBe('processed');
    });

    it('should throw NotFoundException when discrepancy not found', async () => {
      repository.findOneWithoutRelations.mockResolvedValue(null);

      await expect(service.updateStatus(999, 'processed')).rejects.toThrow(NotFoundException);
      expect(repository.findOneWithoutRelations).toHaveBeenCalledWith(999);
    });
  });

  describe('updateStatusSimple', () => {
    it('should update status using simple method', async () => {
      const updatedDiscrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'processed',
        methodProcess: 'conciliation',
      } as ReconciliationDiscrepancy;

      repository.updateStatus.mockResolvedValue(undefined);
      repository.findOne.mockResolvedValue(updatedDiscrepancy);

      const result = await service.updateStatusSimple(1, 'processed');

      expect(repository.updateStatus).toHaveBeenCalledWith(1, 'processed');
      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result.status).toBe('processed');
    });

    it('should throw NotFoundException when update affects 0 rows', async () => {
      repository.updateStatus.mockResolvedValue(undefined);
      repository.findOne.mockRejectedValue(
        new NotFoundException('Discrepancy with ID 999 not found'),
      );

      await expect(service.updateStatusSimple(999, 'processed')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStatus', () => {
    it('should return discrepancies by status with dynamic relations', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        {
          id: 1,
          status: 'new',
          methodProcess: 'conciliation',
          conciliation: { id: 1 } as any,
          liquidation: null,
        } as ReconciliationDiscrepancy,
      ];

      repository.findByStatus.mockResolvedValue(discrepancies);

      const result = await service.findByStatus('new');

      expect(repository.findByStatus).toHaveBeenCalledWith('new');
      expect(result).toHaveLength(1);
      expect(result[0].liquidation).toBeNull();
    });

    it('should handle discrepancies with ambiguous methodProcess in findByStatus', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        {
          id: 2,
          status: 'processed',
          methodProcess: 'other',
          conciliation: { id: 1 } as any,
          liquidation: { id: 1 } as any,
        } as ReconciliationDiscrepancy,
      ];

      repository.findByStatus.mockResolvedValue(discrepancies);

      const result = await service.findByStatus('processed');

      expect(repository.findByStatus).toHaveBeenCalledWith('processed');
      expect(result).toHaveLength(1);
      expect(result[0].liquidation).toBeNull();
      expect(result[0].conciliation).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a discrepancy successfully', async () => {
      repository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Discrepancy 1 eliminada correctamente' });
    });

    it('should throw NotFoundException when discrepancy not found', async () => {
      repository.remove.mockRejectedValue(new Error('Discrepancy 999 no encontrada'));

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.remove).toHaveBeenCalledWith(999);
    });
  });
});
