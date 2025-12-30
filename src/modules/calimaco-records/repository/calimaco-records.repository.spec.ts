import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CalimacoRecordsRepository } from './calimaco-records.repository';
import { CalimacoRecord } from '../entities/calimaco-record.entity';
import { PAGINATION } from '../../../common/constants/constants';

describe('CalimacoRecordsRepository', () => {
  let repository: CalimacoRecordsRepository;
  let calimacoRecordRepository: jest.Mocked<Repository<CalimacoRecord>>;

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
        CalimacoRecordsRepository,
        {
          provide: getRepositoryToken(CalimacoRecord),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<CalimacoRecordsRepository>(CalimacoRecordsRepository);
    calimacoRecordRepository = module.get(getRepositoryToken(CalimacoRecord));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a calimaco record', async () => {
      const recordData: Partial<CalimacoRecord> = {
        collectorId: 1,
        calimacoId: 'CAL001',
        recordDate: new Date(),
        status: 'active',
        amount: 100.50,
      };

      const createdRecord = { id: 1, ...recordData } as CalimacoRecord;
      calimacoRecordRepository.create.mockReturnValue(createdRecord);
      calimacoRecordRepository.save.mockResolvedValue(createdRecord);

      const result = await repository.create(recordData);

      expect(calimacoRecordRepository.create).toHaveBeenCalledWith(recordData);
      expect(calimacoRecordRepository.save).toHaveBeenCalledWith(createdRecord);
      expect(result).toEqual(createdRecord);
    });
  });

  describe('findAll', () => {
    it('should return all calimaco records', async () => {
      const records: CalimacoRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CalimacoRecord,
        { id: 2, calimacoId: 'CAL002' } as CalimacoRecord,
      ];

      calimacoRecordRepository.find.mockResolvedValue(records);

      const result = await repository.findAll();

      expect(calimacoRecordRepository.find).toHaveBeenCalledWith({
        relations: ['collector'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(records);
    });

    it('should return empty array when no records found', async () => {
      calimacoRecordRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a calimaco record by id', async () => {
      const record: CalimacoRecord = {
        id: 1,
        calimacoId: 'CAL001',
        collectorId: 1,
      } as CalimacoRecord;

      calimacoRecordRepository.findOne.mockResolvedValue(record);

      const result = await repository.findOne(1);

      expect(calimacoRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector'],
      });
      expect(result).toEqual(record);
    });

    it('should return null when record not found', async () => {
      calimacoRecordRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('findByCalimacoId', () => {
    it('should return records by calimaco id', async () => {
      const records: CalimacoRecord[] = [
        { id: 1, calimacoId: 'CAL001', calimacoIdNormalized: 'cal001' } as CalimacoRecord,
      ];

      calimacoRecordRepository.find.mockResolvedValue(records);

      const result = await repository.findByCalimacoId('cal001');

      expect(calimacoRecordRepository.find).toHaveBeenCalledWith({
        where: { calimacoIdNormalized: 'cal001' },
        relations: ['collector'],
        order: { recordDate: 'DESC' },
      });
      expect(result).toEqual(records);
    });
  });

  describe('update', () => {
    it('should update a calimaco record', async () => {
      const existingRecord: CalimacoRecord = {
        id: 1,
        status: 'active',
        amount: 100.50,
      } as CalimacoRecord;

      const updateData: Partial<CalimacoRecord> = {
        status: 'completed',
        amount: 150.75,
      };

      calimacoRecordRepository.findOne.mockResolvedValue(existingRecord);
      const updatedRecord = { ...existingRecord, ...updateData };
      calimacoRecordRepository.save.mockResolvedValue(updatedRecord);

      const result = await repository.update(1, updateData);

      expect(calimacoRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector'],
      });
      expect(calimacoRecordRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedRecord);
    });

    it('should throw error when record not found', async () => {
      calimacoRecordRepository.findOne.mockResolvedValue(null);

      await expect(repository.update(999, { status: 'active' })).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove a calimaco record', async () => {
      const record: CalimacoRecord = { id: 1 } as CalimacoRecord;
      calimacoRecordRepository.findOne.mockResolvedValue(record);
      calimacoRecordRepository.remove.mockResolvedValue(record);

      await repository.remove(1);

      expect(calimacoRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['collector'],
      });
      expect(calimacoRecordRepository.remove).toHaveBeenCalledWith(record);
    });

    it('should throw error when record not found', async () => {
      calimacoRecordRepository.findOne.mockResolvedValue(null);

      await expect(repository.remove(999)).rejects.toThrow();
      expect(calimacoRecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['collector'],
      });
      expect(calimacoRecordRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByCollector', () => {
    it('should return records by collector id', async () => {
      const records: CalimacoRecord[] = [
        { id: 1, collectorId: 1 } as CalimacoRecord,
      ];

      calimacoRecordRepository.find.mockResolvedValue(records);

      const result = await repository.findByCollector(1);

      expect(calimacoRecordRepository.find).toHaveBeenCalledWith({
        where: { collectorId: 1 },
        relations: ['collector'],
        order: { recordDate: 'DESC' },
      });
      expect(result).toEqual(records);
    });
  });

  describe('findByStatus', () => {
    it('should return paginated records by status with all filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        getMany: jest.fn().mockResolvedValue([
          { id: 1, status: 'active' } as CalimacoRecord,
        ]),
      } as unknown as SelectQueryBuilder<CalimacoRecord>;

      calimacoRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByStatus('active', 1, 10, 1, '2024-01-01', '2024-01-31');

      expect(calimacoRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('record.status = :status', { status: 'active' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return paginated records by status without optional filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
        getMany: jest.fn().mockResolvedValue([
          { id: 1, status: 'active' } as CalimacoRecord,
        ]),
      } as unknown as SelectQueryBuilder<CalimacoRecord>;

      calimacoRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByStatus('active');

      expect(calimacoRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('record.status = :status', { status: 'active' });
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
      } as unknown as SelectQueryBuilder<CalimacoRecord>;

      calimacoRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.findByStatus('active', 1, 10, undefined, '2024-01-01T10:00:00', '2024-01-31T23:59:59');

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
          { id: 1 } as CalimacoRecord,
        ]),
      } as unknown as SelectQueryBuilder<CalimacoRecord>;

      calimacoRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findWithFilters(1, '2024-01-01', '2024-01-31', 1, 10, 'active,pending');

      expect(calimacoRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
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
      } as unknown as SelectQueryBuilder<CalimacoRecord>;

      calimacoRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findWithFilters();

      expect(calimacoRecordRepository.createQueryBuilder).toHaveBeenCalledWith('record');
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
      } as unknown as SelectQueryBuilder<CalimacoRecord>;

      calimacoRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

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

    it('should handle single status filter', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([]),
      } as unknown as SelectQueryBuilder<CalimacoRecord>;

      calimacoRecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.findWithFilters(undefined, undefined, undefined, 1, 10, 'active');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'record.status IN (:...statusArray)',
        { statusArray: ['active'] },
      );
    });
  });
});

