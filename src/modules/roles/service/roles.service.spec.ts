import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RolesRepository } from '../repository/roles.repository';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

describe('RolesService', () => {
  let service: RolesService;
  let repository: jest.Mocked<RolesRepository>;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RolesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get(RolesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const dto: CreateRoleDto = {
        name: 'ADMIN',
        description: 'Administrator role',
      };

      const createdRole = {
        id: 1,
        name: 'ADMIN',
        description: 'Administrator role',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Role;

      repository.create.mockResolvedValue(createdRole);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdRole);
    });

    it('should create a role without description', async () => {
      const dto: CreateRoleDto = {
        name: 'USER',
      };

      const createdRole = {
        id: 2,
        name: 'USER',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Role;

      repository.create.mockResolvedValue(createdRole);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles: Role[] = [
        { id: 1, name: 'ADMIN' } as Role,
        { id: 2, name: 'USER' } as Role,
      ];

      repository.findAll.mockResolvedValue(roles);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(roles);
    });

    it('should return empty array when no roles found', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const role: Role = {
        id: 1,
        name: 'ADMIN',
        description: 'Administrator role',
      } as Role;

      repository.findOne.mockResolvedValue(role);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(role);
    });

    it('should return null when role not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(repository.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateDto: UpdateRoleDto = {
        name: 'ADMIN_UPDATED',
        description: 'Updated description',
      };

      repository.update.mockResolvedValue(undefined);

      await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(repository.update).toHaveBeenCalledTimes(1);
    });

    it('should update only name', async () => {
      const updateDto: UpdateRoleDto = {
        name: 'USER_UPDATED',
      };

      repository.update.mockResolvedValue(undefined);

      await service.update(2, updateDto);

      expect(repository.update).toHaveBeenCalledWith(2, updateDto);
    });

    it('should handle empty updateDto', async () => {
      const updateDto: UpdateRoleDto = {};

      repository.update.mockResolvedValue(undefined);

      await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should soft delete a role', async () => {
      repository.softDelete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
      expect(repository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should soft delete role with different id', async () => {
      repository.softDelete.mockResolvedValue(undefined);

      await service.remove(42);

      expect(repository.softDelete).toHaveBeenCalledWith(42);
    });
  });
});

