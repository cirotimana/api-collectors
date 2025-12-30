import { Test, TestingModule } from '@nestjs/testing';
import { CollectorRecordsController } from './collector-records.controller';
import { CollectorRecordsService } from './service/collector-records.service';
import { CreateCollectorRecordDto } from './dto/create-collector-record.dto';
import { UpdateCollectorRecordDto } from './dto/update-collector-record.dto';
import { CollectorRecord } from './entities/collector-record.entity';
import { NotFoundException } from '@nestjs/common';
import { PAGINATION } from '../../common/constants/constants';

describe('CollectorRecordsController', () => {
  let controller: CollectorRecordsController;
  let service: jest.Mocked<CollectorRecordsService>;

  const mockCollectorRecordsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCollector: jest.fn(),
    findByProviderStatus: jest.fn(),
    findByCalimacoId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findWithFilters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectorRecordsController],
      providers: [
        {
          provide: CollectorRecordsService,
          useValue: mockCollectorRecordsService,
        },
      ],
    }).compile();

    controller = module.get<CollectorRecordsController>(CollectorRecordsController);
    service = module.get(CollectorRecordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a collector record successfully', async () => {
      const createDto: CreateCollectorRecordDto = {
        collectorId: 1,
        recordDate: '2024-01-01T00:00:00Z',
        calimacoId: 'CAL001',
        amount: 100.50,
        providerStatus: 'active',
      };

      const expectedRecord: CollectorRecord = {
        id: 1,
        ...createDto,
        recordDate: new Date(createDto.recordDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CollectorRecord;

      service.create.mockResolvedValue(expectedRecord);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedRecord);
    });

    it('should create a record with optional fields', async () => {
      const createDto: CreateCollectorRecordDto = {
        collectorId: 2,
        recordDate: '2024-01-02T00:00:00Z',
        calimacoId: 'CAL002',
        amount: 200.75,
        providerStatus: 'pending',
        calimacoIdNormalized: 'cal002',
        providerId: 'PROV001',
        clientName: 'Test Client',
      };

      const expectedRecord: CollectorRecord = {
        id: 2,
        ...createDto,
        recordDate: new Date(createDto.recordDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CollectorRecord;

      service.create.mockResolvedValue(expectedRecord);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedRecord);
    });
  });

  describe('findAll', () => {
    it('should return all collector records', async () => {
      const records: CollectorRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CollectorRecord,
        { id: 2, calimacoId: 'CAL002' } as CollectorRecord,
      ];

      service.findAll.mockResolvedValue(records);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(records);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no records found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a collector record by id', async () => {
      const recordId = '1';
      const expectedRecord: CollectorRecord = {
        id: 1,
        calimacoId: 'CAL001',
        collectorId: 1,
        amount: 100.50,
      } as CollectorRecord;

      service.findOne.mockResolvedValue(expectedRecord);

      const result = await controller.findOne(recordId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedRecord);
    });

    it('should throw NotFoundException when record not found', async () => {
      const recordId = '999';

      service.findOne.mockRejectedValue(
        new NotFoundException('Collector record with ID 999 not found'),
      );

      await expect(controller.findOne(recordId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCollector', () => {
    it('should return records by collector id', async () => {
      const collectorId = '1';
      const records: CollectorRecord[] = [
        { id: 1, collectorId: 1 } as CollectorRecord,
        { id: 2, collectorId: 1 } as CollectorRecord,
      ];

      service.findByCollector.mockResolvedValue(records);

      const result = await controller.findByCollector(collectorId);

      expect(service.findByCollector).toHaveBeenCalledWith(1);
      expect(result).toEqual(records);
    });
  });

  describe('findByProviderStatus', () => {
    it('should return paginated records by provider status with default values', async () => {
      const providerStatus = 'active';
      const expectedResult = {
        data: [{ id: 1, providerStatus: 'active' } as CollectorRecord],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      };

      service.findByProviderStatus.mockResolvedValue(expectedResult);

      const result = await controller.findByProviderStatus(providerStatus);

      expect(service.findByProviderStatus).toHaveBeenCalledWith(
        providerStatus,
        1,
        50,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated records with custom parameters', async () => {
      const providerStatus = 'pending';
      const expectedResult = {
        data: [{ id: 2, providerStatus: 'pending' } as CollectorRecord],
        total: 10,
        page: 2,
        limit: 20,
        totalPages: 1,
      };

      service.findByProviderStatus.mockResolvedValue(expectedResult);

      const result = await controller.findByProviderStatus(
        providerStatus,
        '2',
        '20',
        '1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(service.findByProviderStatus).toHaveBeenCalledWith(
        providerStatus,
        2,
        20,
        1,
        '2024-01-01',
        '2024-01-31',
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByCalimacoId', () => {
    it('should return records by calimaco id', async () => {
      const calimacoId = 'CAL001';
      const records: CollectorRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CollectorRecord,
      ];

      service.findByCalimacoId.mockResolvedValue(records);

      const result = await controller.findByCalimacoId(calimacoId);

      expect(service.findByCalimacoId).toHaveBeenCalledWith(calimacoId);
      expect(result).toEqual(records);
    });

    it('should throw NotFoundException when no records found', async () => {
      const calimacoId = 'NONEXISTENT';

      service.findByCalimacoId.mockRejectedValue(
        new NotFoundException(`Collector records with calimacoId ${calimacoId} not found`),
      );

      await expect(controller.findByCalimacoId(calimacoId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a collector record successfully', async () => {
      const recordId = '1';
      const updateDto: UpdateCollectorRecordDto = {
        providerStatus: 'completed',
        amount: 150.75,
      };

      const updatedRecord: CollectorRecord = {
        id: 1,
        providerStatus: 'completed',
        amount: 150.75,
      } as CollectorRecord;

      service.update.mockResolvedValue(updatedRecord);

      const result = await controller.update(recordId, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('remove', () => {
    it('should delete a collector record successfully', async () => {
      const recordId = '1';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(recordId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered records with default pagination', async () => {
      const expectedResult = {
        data: [{ id: 1 } as CollectorRecord],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      };

      service.findWithFilters.mockResolvedValue(expectedResult);

      const result = await controller.findWithFilters();

      expect(service.findWithFilters).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        1,
        50,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return filtered records with all parameters', async () => {
      const expectedResult = {
        data: [{ id: 2 } as CollectorRecord],
        total: 5,
        page: 2,
        limit: 10,
        totalPages: 1,
      };

      service.findWithFilters.mockResolvedValue(expectedResult);

      const result = await controller.findWithFilters(
        '1',
        '2024-01-01',
        '2024-01-31',
        '2',
        '10',
        'active,pending',
      );

      expect(service.findWithFilters).toHaveBeenCalledWith(
        1,
        '2024-01-01',
        '2024-01-31',
        2,
        10,
        'active,pending',
      );
      expect(result).toEqual(expectedResult);
    });
  });
});

