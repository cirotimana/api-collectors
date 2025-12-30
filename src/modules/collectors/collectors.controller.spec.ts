import { Test, TestingModule } from '@nestjs/testing';
import { CollectorsController } from './collectors.controller';
import { CollectorsService } from './service/collectors.service';
import { Collector } from './entities/collector.entity';

describe('CollectorsController', () => {
  let controller: CollectorsController;
  let service: jest.Mocked<CollectorsService>;

  const mockCollectorsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectorsController],
      providers: [
        {
          provide: CollectorsService,
          useValue: mockCollectorsService,
        },
      ],
    }).compile();

    controller = module.get<CollectorsController>(CollectorsController);
    service = module.get(CollectorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all collectors', async () => {
      const collectors: Collector[] = [
        { id: 1, name: 'Collector 1' } as Collector,
        { id: 2, name: 'Collector 2' } as Collector,
      ];

      service.findAll.mockResolvedValue(collectors);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(collectors);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no collectors found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a collector by id', async () => {
      const collectorId = '1';
      const expectedCollector: Collector = {
        id: 1,
        name: 'Collector 1',
      } as Collector;

      service.findOne.mockResolvedValue(expectedCollector);

      const result = await controller.findOne(collectorId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCollector);
    });

    it('should return null when collector not found', async () => {
      const collectorId = '999';

      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(collectorId);

      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should handle string id conversion correctly', async () => {
      const collectorId = '123';
      const expectedCollector: Collector = {
        id: 123,
        name: 'Collector 123',
      } as Collector;

      service.findOne.mockResolvedValue(expectedCollector);

      const result = await controller.findOne(collectorId);

      expect(service.findOne).toHaveBeenCalledWith(123);
      expect(result).toEqual(expectedCollector);
    });
  });
});

