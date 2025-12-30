import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CollectorRecordsRepository } from './collector-records.repository';
import { CollectorRecord } from '../entities/collector-record.entity';
import { PAGINATION } from '../../../common/constants/constants';

describe('CollectorRecordsRepository', () => {
  let repository: CollectorRecordsRepository;
  let collectorRecordRepository: jest.Mocked<Repository<CollectorRecord>>;

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorRecordsRepository,
        {
          provide: getRepositoryToken(CollectorRecord),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<CollectorRecordsRepository>(CollectorRecordsRepository);
    collectorRecordRepository = module.get(getRepositoryToken(CollectorRecord));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a collector record', async () => {
      const recordData: Partial<CollectorRecord> = {
        collectorId: 1,
        calimacoId: 'CAL001',
        recordDate: new Date(),
        amount: 100.50,
        providerStatus: 'active',
      };

      const createdRecord = { id: 1, ...recordData } as CollectorRecord;
      collectorRecordRepository.create.mockReturnValue(createdRecord);
      collectorRecordRepository.save.mockResolvedValue(createdRecord);

      const result = await repository.create(recordData);

      expect(collectorRecordRepository.create).toHaveBeenCalledWith(recordData);
      expect(collectorRecordRepository.save).toHaveBeenCalledWith(createdRecord);
      expect(result).toEqual(createdRecord);
    });
  });

  describe('findAll', () => {
    it('should return all collector records', async () => {
      const records: CollectorRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CollectorRecord,
        { id: 2, calimacoId: 'CAL002' } as CollectorRecord,
      ];

      collectorRecordRepository.find.mockResolvedValue(records);

      const result = await repository.findAll();

      expect(collectorRecordRepository.find).toHaveBeenCalledWith({
        relations: ['collector'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(records);
    });

    it('should return empty array when no records found', async () => {
      collectorRecordRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

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

      collectorRecordRepository.findOne.mockResolvedValue(record);

      const result = await repository.findOne(1);

      expect(collectorRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector'],
      });
      expect(result).toEqual(record);
    });

    it('should return null when record not found', async () => {
      collectorRecordRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByCalimacoId', () => {
    it('should return records by calimaco id', async () => {
      const records: CollectorRecord[] = [
        { id: 1, calimacoId: 'CAL001', calimacoIdNormalized: 'cal001' } as CollectorRecord,
      ];

      collectorRecordRepository.find.mockResolvedValue(records);

      const result = await repository.findByCalimacoId('cal001');

      expect(collectorRecordRepository.find).toHaveBeenCalledWith({
        where: { calimacoIdNormalized: 'cal001' },
        relations: ['collector'],
        order: { recordDate: 'DESC' },
      });
      expect(result).toEqual(records);
    });
  });

  describe('update', () => {
    it('should update a collector record', async () => {
      const existingRecord: CollectorRecord = {
        id: 1,
        providerStatus: 'active',
        amount: 100.50,
      } as CollectorRecord;

      const updateData: Partial<CollectorRecord> = {
        providerStatus: 'completed',
        amount: 150.75,
      };

      collectorRecordRepository.findOne.mockResolvedValue(existingRecord);
      const updatedRecord = { ...existingRecord, ...updateData };
      collectorRecordRepository.save.mockResolvedValue(updatedRecord);

      const result = await repository.update(1, updateData);

      expect(collectorRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector'],
      });
      expect(collectorRecordRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedRecord);
    });

    it('should throw error when record not found', async () => {
      collectorRecordRepository.findOne.mockResolvedValue(null);

      await expect(repository.update(999, { providerStatus: 'active' })).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove a collector record', async () => {
      const record: CollectorRecord = { id: 1 } as CollectorRecord;
      collectorRecordRepository.findOne.mockResolvedValue(record);
      collectorRecordRepository.remove.mockResolvedValue(record);

      await repository.remove(1);

      expect(collectorRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector'],
      });
      expect(collectorRecordRepository.remove).toHaveBeenCalledWith(record);
    });

    it('should throw error when record not found', async () => {
      collectorRecordRepository.findOne.mockResolvedValue(null);

      await expect(repository.remove(999)).rejects.toThrow();
      expect(collectorRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['collector'],
      });
      expect(collectorRecordRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByCollector', () => {
    it('should return records by collector id', async () => {
      const records: CollectorRecord[] = [
        { id: 1, collectorId: 1 } as CollectorRecord,
      ];

      collectorRecordRepository.find.mockResolvedValue(records);

      const result = await repository.findByCollector(1);

      expect(collectorRecordRepository.find).toHaveBeenCalledWith({
        where: { collectorId: 1 },
        relations: ['collector'],
        order: { recordDate: 'DESC' },
      });
      expect(result).toEqual(records);
    });
  });

  describe('findByProviderStatus', () => {
    it('should return paginated records by provider status with all filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        getMany: jest.fn().mockResolvedValue([
          { id: 1, providerStatus: 'active' } as CollectorRecord,
        ]),
      } as unknown as SelectQueryBuilder<CollectorRecord>;

      collectorRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByProviderStatus('active', 1, 10, 1, '2024-01-01', '2024-01-31');

      expect(collectorRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('record.providerStatus = :providerStatus', { providerStatus: 'active' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return paginated records by provider status without optional filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
        getMany: jest.fn().mockResolvedValue([
          { id: 1, providerStatus: 'active' } as CollectorRecord,
        ]),
      } as unknown as SelectQueryBuilder<CollectorRecord>;

      collectorRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByProviderStatus('active');

      expect(collectorRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('record.providerStatus = :providerStatus', { providerStatus: 'active' });
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result.total).toBe(5);
    });

    it('should handle date with time included', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<CollectorRecord>;

      collectorRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.findByProviderStatus('active', 1, 10, undefined, '2024-01-01T10:00:00', '2024-01-31T23:59:59');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.recordDate >= :fromDate',
        { fromDate: '2024-01-01T10:00:00' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.recordDate <= :toDate',
        { toDate: '2024-01-31T23:59:59' },
      );
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered records with all filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
        getMany: jest.fn().mockResolvedValue([
          { id: 1 } as CollectorRecord,
        ]),
      } as unknown as SelectQueryBuilder<CollectorRecord>;

      collectorRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findWithFilters(1, '2024-01-01', '2024-01-31', 1, 10, 'active,pending');

      expect(collectorRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(4);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(5);
    });

    it('should return filtered records without optional filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<CollectorRecord>;

      collectorRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findWithFilters();

      expect(collectorRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle date with time included in findWithFilters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<CollectorRecord>;

      collectorRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.findWithFilters(1, '2024-01-01T10:00:00', '2024-01-31T23:59:59');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.recordDate >= :fromDate',
        { fromDate: '2024-01-01T10:00:00' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.recordDate <= :toDate',
        { toDate: '2024-01-31T23:59:59' },
      );
    });

    it('should handle single providerStatus filter', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<CollectorRecord>;

      collectorRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.findWithFilters(undefined, undefined, undefined, 1, 10, 'active');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.providerStatus IN (:...statusArray)',
        { statusArray: ['active'] },
      );
    });
  });
});

