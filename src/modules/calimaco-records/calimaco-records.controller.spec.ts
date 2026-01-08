import { Test, TestingModule } from '@nestjs/testing';
import { CalimacoRecordsController } from './calimaco-records.controller';
import { CalimacoRecordsService } from './service/calimaco-records.service';
import { CreateCalimacoRecordDto } from './dto/create-calimaco-record.dto';
import { UpdateCalimacoRecordDto } from './dto/update-calimaco-record.dto';
import { CalimacoRecord } from './entities/calimaco-record.entity';
import { NotFoundException } from '@nestjs/common';
import { PAGINATION } from '../../common/constants/constants';

describe('CalimacoRecordsController', () => {
  let controller: CalimacoRecordsController;
  let service: jest.Mocked<CalimacoRecordsService>;

  const mockCalimacoRecordsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCollector: jest.fn(),
    findByStatus: jest.fn(),
    findByCalimacoId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findWithFilters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalimacoRecordsController],
      providers: [
        {
          provide: CalimacoRecordsService,
          useValue: mockCalimacoRecordsService,
        },
      ],
    }).compile();

    controller = module.get<CalimacoRecordsController>(CalimacoRecordsController);
    service = module.get(CalimacoRecordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a calimaco record successfully', async () => {
      const createDto: CreateCalimacoRecordDto = {
        collectorId: 1,
        calimacoId: 'CAL001',
        calimacoIdNormalized: 'cal001',
        recordDate: '2024-01-01T00:00:00Z',
        status: 'active',
        amount: 100.50,
      };

      const expectedRecord: CalimacoRecord = {
        id: 1,
        ...createDto,
        recordDate: new Date(createDto.recordDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CalimacoRecord;

      service.create.mockResolvedValue(expectedRecord);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedRecord);
    });

    it('should create a record with optional fields', async () => {
      const createDto: CreateCalimacoRecordDto = {
        collectorId: 2,
        calimacoId: 'CAL002',
        recordDate: '2024-01-02T00:00:00Z',
        status: 'pending',
        amount: 200.75,
        userId: 'user123',
        externalId: 'ext123',
        comments: 'Test comment',
      };

      const expectedRecord: CalimacoRecord = {
        id: 2,
        ...createDto,
        recordDate: new Date(createDto.recordDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CalimacoRecord;

      service.create.mockResolvedValue(expectedRecord);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedRecord);
    });
  });

  describe('findAll', () => {
    it('should return all calimaco records', async () => {
      const records: CalimacoRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CalimacoRecord,
        { id: 2, calimacoId: 'CAL002' } as CalimacoRecord,
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
    it('should return a calimaco record by id', async () => {
      const recordId = '1';
      const expectedRecord: CalimacoRecord = {
        id: 1,
        calimacoId: 'CAL001',
        collectorId: 1,
        amount: 100.50,
      } as CalimacoRecord;

      service.findOne.mockResolvedValue(expectedRecord);

      const result = await controller.findOne(recordId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedRecord);
    });

    it('should throw NotFoundException when record not found', async () => {
      const recordId = '999';

      service.findOne.mockRejectedValue(
        new NotFoundException('Calimaco record with ID 999 not found'),
      );

      await expect(controller.findOne(recordId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCollector', () => {
    it('should return records by collector id', async () => {
      const collectorId = '1';
      const records: CalimacoRecord[] = [
        { id: 1, collectorId: 1 } as CalimacoRecord,
        { id: 2, collectorId: 1 } as CalimacoRecord,
      ];

      service.findByCollector.mockResolvedValue(records);

      const result = await controller.findByCollector(collectorId);

      expect(service.findByCollector).toHaveBeenCalledWith(1);
      expect(result).toEqual(records);
    });
  });

  describe('findByStatus', () => {
    it('should return paginated records by status with default values', async () => {
      const status = 'active';
      const expectedResult = {
        data: [{ id: 1, status: 'active' } as CalimacoRecord],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      };

      service.findByStatus.mockResolvedValue(expectedResult);

      const result = await controller.findByStatus(status);

      expect(service.findByStatus).toHaveBeenCalledWith(
        status,
        1,
        50,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated records with custom parameters', async () => {
      const status = 'pending';
      const expectedResult = {
        data: [{ id: 2, status: 'pending' } as CalimacoRecord],
        total: 10,
        page: 2,
        limit: 20,
        totalPages: 1,
      };

      service.findByStatus.mockResolvedValue(expectedResult);

      const result = await controller.findByStatus(
        status,
        '2',
        '20',
        '1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(service.findByStatus).toHaveBeenCalledWith(
        status,
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
      const records: CalimacoRecord[] = [
        { id: 1, calimacoId: 'CAL001' } as CalimacoRecord,
      ];

      service.findByCalimacoId.mockResolvedValue(records);

      const result = await controller.findByCalimacoId(calimacoId);

      expect(service.findByCalimacoId).toHaveBeenCalledWith(calimacoId);
      expect(result).toEqual(records);
    });

    it('should throw NotFoundException when no records found', async () => {
      const calimacoId = 'NONEXISTENT';

      service.findByCalimacoId.mockRejectedValue(
        new NotFoundException(`Calimaco records with calimacoId ${calimacoId} not found`),
      );

      await expect(controller.findByCalimacoId(calimacoId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a calimaco record successfully', async () => {
      const recordId = '1';
      const updateDto: UpdateCalimacoRecordDto = {
        status: 'completed',
        amount: 150.75,
      };

      const updatedRecord: CalimacoRecord = {
        id: 1,
        status: 'completed',
        amount: 150.75,
      } as CalimacoRecord;

      service.update.mockResolvedValue(updatedRecord);

      const result = await controller.update(recordId, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('remove', () => {
    it('should delete a calimaco record successfully', async () => {
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
        data: [{ id: 1 } as CalimacoRecord],
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
        data: [{ id: 2 } as CalimacoRecord],
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

