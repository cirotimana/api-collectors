import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RolesRepository } from './roles.repository';
import { Role } from '../entities/role.entity';

describe('RolesRepository', () => {
  let repository: RolesRepository;
  let rolesRepository: jest.Mocked<Repository<Role>>;

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesRepository,
        {
          provide: getRepositoryToken(Role),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<RolesRepository>(RolesRepository);
    rolesRepository = module.get(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const roleData: Partial<Role> = {
        name: 'ADMIN',
        description: 'Administrator role',
      };

      const createdRole = { id: 1, ...roleData } as Role;
      rolesRepository.create.mockReturnValue(createdRole);
      rolesRepository.save.mockResolvedValue(createdRole);

      const result = await repository.create(roleData);

      expect(rolesRepository.create).toHaveBeenCalledWith(roleData);
      expect(rolesRepository.save).toHaveBeenCalledWith(createdRole);
      expect(result).toEqual(createdRole);
    });

    it('should create a role without description', async () => {
      const roleData: Partial<Role> = {
        name: 'USER',
      };

      const createdRole = { id: 2, ...roleData } as Role;
      rolesRepository.create.mockReturnValue(createdRole);
      rolesRepository.save.mockResolvedValue(createdRole);

      const result = await repository.create(roleData);

      expect(rolesRepository.create).toHaveBeenCalledWith(roleData);
      expect(result).toEqual(createdRole);
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted roles', async () => {
      const roles: Role[] = [
        { id: 1, name: 'ADMIN', deletedAt: null } as Role,
        { id: 2, name: 'USER', deletedAt: null } as Role,
      ];

      rolesRepository.find.mockResolvedValue(roles);

      const result = await repository.findAll();

      expect(rolesRepository.find).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
      });
      expect(result).toEqual(roles);
    });

    it('should return empty array when no roles found', async () => {
      rolesRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const role: Role = {
        id: 1,
        name: 'ADMIN',
        deletedAt: null,
      } as Role;

      rolesRepository.findOne.mockResolvedValue(role);

      const result = await repository.findOne(1);

      expect(rolesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: IsNull() },
      });
      expect(result).toEqual(role);
    });

    it('should return null when role not found', async () => {
      rolesRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });

    it('should return null when role is soft deleted', async () => {
      rolesRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(1);

      expect(rolesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: IsNull() },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateData: Partial<Role> = {
        name: 'ADMIN_UPDATED',
        description: 'Updated description',
      };

      rolesRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(1, updateData);

      expect(rolesRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(rolesRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle update with empty data', async () => {
      const updateData: Partial<Role> = {};

      rolesRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.update(1, updateData);

      expect(rolesRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle update of non-existent role', async () => {
      const updateData: Partial<Role> = {
        name: 'NONEXISTENT',
      };

      rolesRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.update(999, updateData);

      expect(rolesRepository.update).toHaveBeenCalledWith(999, updateData);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a role', async () => {
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      rolesRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.softDelete(1);

      expect(rolesRepository.update).toHaveBeenCalledWith(1, {
        deletedAt: mockDate,
      });
      expect(rolesRepository.update).toHaveBeenCalledTimes(1);

      jest.restoreAllMocks();
    });

    it('should handle soft delete of non-existent role', async () => {
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      rolesRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.softDelete(999);

      expect(rolesRepository.update).toHaveBeenCalledWith(999, {
        deletedAt: mockDate,
      });

      jest.restoreAllMocks();
    });
  });
});

