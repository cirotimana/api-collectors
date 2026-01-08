import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './service/roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

describe('RolesController', () => {
  let controller: RolesController;
  let service: jest.Mocked<RolesService>;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'ADMIN',
        description: 'Administrator role',
      };

      const expectedRole = {
        id: 1,
        name: 'ADMIN',
        description: 'Administrator role',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Role;

      service.create.mockResolvedValue(expectedRole);

      const result = await controller.create(createRoleDto);

      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedRole);
    });

    it('should create a role without description', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'USER',
      };

      const expectedRole = {
        id: 2,
        name: 'USER',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Role;

      service.create.mockResolvedValue(expectedRole);

      const result = await controller.create(createRoleDto);

      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(expectedRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const roles: Role[] = [
        { id: 1, name: 'ADMIN' } as Role,
        { id: 2, name: 'USER' } as Role,
      ];

      service.findAll.mockResolvedValue(roles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(roles);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no roles found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const roleId = '1';
      const expectedRole: Role = {
        id: 1,
        name: 'ADMIN',
        description: 'Administrator role',
      } as Role;

      service.findOne.mockResolvedValue(expectedRole);

      const result = await controller.findOne(roleId);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedRole);
    });

    it('should return null when role not found', async () => {
      const roleId = '999';

      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(roleId);

      expect(service.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {
        name: 'ADMIN_UPDATED',
        description: 'Updated description',
      };

      service.update.mockResolvedValue(undefined);

      const result = await controller.update(roleId, updateRoleDto);

      expect(service.update).toHaveBeenCalledWith(1, updateRoleDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should update only name', async () => {
      const roleId = '2';
      const updateRoleDto: UpdateRoleDto = {
        name: 'USER_UPDATED',
      };

      service.update.mockResolvedValue(undefined);

      const result = await controller.update(roleId, updateRoleDto);

      expect(service.update).toHaveBeenCalledWith(2, updateRoleDto);
      expect(result).toBeUndefined();
    });

    it('should handle empty updateRoleDto', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {};

      service.update.mockResolvedValue(undefined);

      const result = await controller.update(roleId, updateRoleDto);

      expect(service.update).toHaveBeenCalledWith(1, updateRoleDto);
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a role successfully', async () => {
      const roleId = '1';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(roleId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should delete role with different id', async () => {
      const roleId = '42';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(roleId);

      expect(service.remove).toHaveBeenCalledWith(42);
    });
  });
});

