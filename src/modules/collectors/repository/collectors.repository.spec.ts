import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectorsRepository } from './collectors.repository';
import { Collector } from '../entities/collector.entity';

describe('CollectorsRepository', () => {
  let repository: CollectorsRepository;
  let collectorRepository: jest.Mocked<Repository<Collector>>;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectorsRepository,
        {
          provide: getRepositoryToken(Collector),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<CollectorsRepository>(CollectorsRepository);
    collectorRepository = module.get(getRepositoryToken(Collector));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all collectors with relations', async () => {
      const collectors: Collector[] = [
        { id: 1, name: 'Collector 1' } as Collector,
        { id: 2, name: 'Collector 2' } as Collector,
      ];

      collectorRepository.find.mockResolvedValue(collectors);

      const result = await repository.findAll();

      expect(collectorRepository.find).toHaveBeenCalledWith({
        relations: ['createdBy', 'updatedBy'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(collectors);
    });

    it('should return empty array when no collectors found', async () => {
      collectorRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a collector by id with relations', async () => {
      const collector: Collector = {
        id: 1,
        name: 'Collector 1',
      } as Collector;

      collectorRepository.findOne.mockResolvedValue(collector);

      const result = await repository.findOne(1);

      expect(collectorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['createdBy', 'updatedBy'],
      });
      expect(result).toEqual(collector);
    });

    it('should return null when collector not found', async () => {
      collectorRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });

    it('should handle zero as id', async () => {
      collectorRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(0);

      expect(collectorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 0 },
        relations: ['createdBy', 'updatedBy'],
      });
      expect(result).toBeNull();
    });
  });
});

