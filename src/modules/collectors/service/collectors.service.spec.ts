import { Test, TestingModule } from '@nestjs/testing';
import { CollectorsService } from './collectors.service';
import { CollectorsRepository } from '../repository/collectors.repository';
import { Collector } from '../entities/collector.entity';

describe('CollectorsService', () => {
  let service: CollectorsService;
  let repository: jest.Mocked<CollectorsRepository>;

  const mockRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorsService,
        {
          provide: CollectorsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CollectorsService>(CollectorsService);
    repository = module.get(CollectorsRepository);
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

      repository.findAll.mockResolvedValue(collectors);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(collectors);
    });

    it('should return empty array when no collectors found', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a collector by id', async () => {
      const collector: Collector = {
        id: 1,
        name: 'Collector 1',
      } as Collector;

      repository.findOne.mockResolvedValue(collector);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(collector);
    });

    it('should return null when collector not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });
});

