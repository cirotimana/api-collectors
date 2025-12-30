import { Test, TestingModule } from '@nestjs/testing';
import { ReconciliationDiscrepanciesController } from './reconciliation-discrepancies.controller';
import { ReconciliationDiscrepanciesService } from './service/reconciliation-discrepancies.service';
import { ReconciliationDiscrepancy } from './entities/reconciliation-discrepancies.entity';
import { NotFoundException } from '@nestjs/common';

describe('ReconciliationDiscrepanciesController', () => {
  let controller: ReconciliationDiscrepanciesController;
  let service: jest.Mocked<ReconciliationDiscrepanciesService>;

  const mockReconciliationDiscrepanciesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReconciliationDiscrepanciesController],
      providers: [
        {
          provide: ReconciliationDiscrepanciesService,
          useValue: mockReconciliationDiscrepanciesService,
        },
      ],
    }).compile();

    controller = module.get<ReconciliationDiscrepanciesController>(ReconciliationDiscrepanciesController);
    service = module.get(ReconciliationDiscrepanciesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all reconciliation discrepancies', async () => {
      const discrepancies: ReconciliationDiscrepancy[] = [
        { id: 1, status: 'new', methodProcess: 'conciliation' } as ReconciliationDiscrepancy,
        { id: 2, status: 'processed', methodProcess: 'liquidation' } as ReconciliationDiscrepancy,
      ];

      service.findAll.mockResolvedValue(discrepancies);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(discrepancies);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no discrepancies found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a reconciliation discrepancy by id', async () => {
      const discrepancyId = '1';
      const expectedDiscrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'new',
        methodProcess: 'conciliation',
        difference: 100.50,
      } as ReconciliationDiscrepancy;

      service.findOne.mockResolvedValue(expectedDiscrepancy);

      const result = await controller.findOne(discrepancyId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedDiscrepancy);
    });

    it('should throw NotFoundException when discrepancy not found', async () => {
      const discrepancyId = '999';

      service.findOne.mockRejectedValue(
        new NotFoundException('Discrepancy with ID 999 not found'),
      );

      await expect(controller.findOne(discrepancyId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('updateStatus', () => {
    it('should update discrepancy status successfully', async () => {
      const discrepancyId = '1';
      const body = { status: 'processed' };
      const updatedDiscrepancy: ReconciliationDiscrepancy = {
        id: 1,
        status: 'processed',
        methodProcess: 'conciliation',
      } as ReconciliationDiscrepancy;

      service.updateStatus.mockResolvedValue(updatedDiscrepancy);

      const result = await controller.updateStatus(discrepancyId, body);

      expect(service.updateStatus).toHaveBeenCalledWith(1, 'processed');
      expect(service.updateStatus).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedDiscrepancy);
    });

    it('should throw NotFoundException when discrepancy not found', async () => {
      const discrepancyId = '999';
      const body = { status: 'processed' };

      service.updateStatus.mockRejectedValue(
        new NotFoundException('Discrepancy with ID 999 not found'),
      );

      await expect(controller.updateStatus(discrepancyId, body)).rejects.toThrow(NotFoundException);
      expect(service.updateStatus).toHaveBeenCalledWith(999, 'processed');
    });
  });

  describe('remove', () => {
    it('should delete a reconciliation discrepancy successfully', async () => {
      const discrepancyId = '1';
      const expectedMessage = { message: 'Discrepancy 1 eliminada correctamente' };

      service.remove.mockResolvedValue(expectedMessage);

      const result = await controller.remove(discrepancyId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedMessage);
    });

    it('should throw NotFoundException when discrepancy not found', async () => {
      const discrepancyId = '999';

      service.remove.mockRejectedValue(
        new NotFoundException('Discrepancy 999 no encontrada'),
      );

      await expect(controller.remove(discrepancyId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });
});
