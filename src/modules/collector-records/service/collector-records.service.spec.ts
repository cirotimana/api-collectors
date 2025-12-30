import { Test, TestingModule } from '@nestjs/testing';
import { CollectorRecordsService } from './collector-records.service';
import { CollectorRecordsRepository } from '../repository/collector-records.repository';
import { CollectorRecord } from '../entities/collector-record.entity';
import { CreateCollectorRecordDto } from '../dto/create-collector-record.dto';
import { UpdateCollectorRecordDto } from '../dto/update-collector-record.dto';
import { NotFoundException } from '@nestjs/common';
import { PAGINATION } from '../../../common/constants/constants';

describe('CollectorRecordsService', () => {
  let service: CollectorRecordsService;
  let repository: jest.Mocked<CollectorRecordsRepository>;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCalimacoId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCollector: jest.fn(),
    findByProviderStatus: jest.fn(),
    findWithFilters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorRecordsService,
        {
          provide: CollectorRecordsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CollectorRecordsService>(CollectorRecordsService);
    repository = module.get(CollectorRecordsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a collector record', async () => {
      const dto: CreateCollectorRecordDto = {
        collectorId: 1,
        recordDate: '2024-01-01T00:00:00Z',
        calimacoId: 'CAL001',
        amount: 100.50,
        providerStatus: 'active',
      };

      const createdRecord: CollectorRecord = {
        id: 1,
        ...dto,
        recordDate: new Date(dto.recordDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CollectorRecord;

      repository.create.mockResolvedValue(createdRecord);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdRecord);
    });
  });

  describe('findAll', () => {
    it('should return all collector records', async () => {
      const records: CollectorRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CollectorRecord,
        { id: 2, calimacoId: 'CAL002' } as CollectorRecord,
      ];

      repository.findAll.mockResolvedValue(records);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(records);
    });

    it('should return empty array when no records found', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a collector record by id', async () => {
      const record: CollectorRecord = {
        id: 1,
        calimacoId: 'CAL001',
        collectorId: 1,
      } as CollectorRecord;

      repository.findOne.mockResolvedValue(record);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(record);
    });

    it('should throw NotFoundException when record not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCalimacoId', () => {
    it('should return records by calimaco id', async () => {
      const records: CollectorRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CollectorRecord,
      ];

      repository.findByCalimacoId.mockResolvedValue(records);

      const result = await service.findByCalimacoId('CAL001');

      expect(repository.findByCalimacoId).toHaveBeenCalledWith('CAL001');
      expect(result).toEqual(records);
    });

    it('should throw NotFoundException when no records found', async () => {
      repository.findByCalimacoId.mockResolvedValue([]);

      await expect(service.findByCalimacoId('NONEXISTENT')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a collector record', async () => {
      const updateDto: UpdateCollectorRecordDto = {
        providerStatus: 'completed',
        amount: 150.75,
      };

      const updatedRecord: CollectorRecord = {
        id: 1,
        providerStatus: 'completed',
        amount: 150.75,
      } as CollectorRecord;

      repository.update.mockResolvedValue(updatedRecord);

      const result = await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('remove', () => {
    it('should remove a collector record', async () => {
      repository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when repository fails', async () => {
      const error = new Error('Database error');
      repository.remove.mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow('Database error');
      expect(repository.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('findByCollector', () => {
    it('should return records by collector id', async () => {
      const records: CollectorRecord[] = [
        { id: 1, collectorId: 1 } as CollectorRecord,
      ];

      repository.findByCollector.mockResolvedValue(records);

      const result = await service.findByCollector(1);

      expect(repository.findByCollector).toHaveBeenCalledWith(1);
      expect(result).toEqual(records);
    });
  });

  describe('findByProviderStatus', () => {
    it('should return paginated records by provider status with default values', async () => {
      const expectedResult = {
        data: [{ id: 1, providerStatus: 'active' } as CollectorRecord],
        total: 1,
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        totalPages: 1,
      };

      repository.findByProviderStatus.mockResolvedValue(expectedResult);

      const result = await service.findByProviderStatus('active');

      expect(repository.findByProviderStatus).toHaveBeenCalledWith(
        'active',
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated records with custom parameters', async () => {
      const expectedResult = {
        data: [{ id: 2, providerStatus: 'pending' } as CollectorRecord],
        total: 10,
        page: 2,
        limit: 20,
        totalPages: 1,
      };

      repository.findByProviderStatus.mockResolvedValue(expectedResult);

      const result = await service.findByProviderStatus('pending', 2, 20, 1, '2024-01-01', '2024-01-31');

      expect(repository.findByProviderStatus).toHaveBeenCalledWith(
        'pending',
        2,
        20,
        1,
        '2024-01-01',
        '2024-01-31',
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered records with default pagination', async () => {
      const expectedResult = {
        data: [{ id: 1 } as CollectorRecord],
        total: 1,
        page: PAGINATION.DEFAULT_PAGE,
        limit: PAGINATION.DEFAULT_LIMIT,
        totalPages: 1,
      };

      repository.findWithFilters.mockResolvedValue(expectedResult);

      const result = await service.findWithFilters();

      expect(repository.findWithFilters).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        PAGINATION.DEFAULT_PAGE,
        PAGINATION.DEFAULT_LIMIT,
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

      repository.findWithFilters.mockResolvedValue(expectedResult);

      const result = await service.findWithFilters(1, '2024-01-01', '2024-01-31', 2, 10, 'active');

      expect(repository.findWithFilters).toHaveBeenCalledWith(
        1,
        '2024-01-01',
        '2024-01-31',
        2,
        10,
        'active',
      );
      expect(result).toEqual(expectedResult);
    });
  });
});

