import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UserRole } from '../../../entities/user-role.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersRepository } from '../repository/users.repository';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  const mockUsersRepository = {
    findAll: jest.fn(),
    findOneByUsername: jest.fn(),
    findOneById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findUserRoleByUserId: jest.fn(),
    createUserRole: jest.fn(),
    updateUserRole: jest.fn(),
    softDeleteUserRoles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });



  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 1 }, { id: 2 }] as User[];
      usersRepository.findAll.mockResolvedValue({ data: users, total: 2 });

      const result = await service.findAll(1, 10);

      expect(usersRepository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({ data: users, total: 2 });
      expect(result.data).toHaveLength(2);
    });

    it('should return paginated users with default values', async () => {
      const users = [{ id: 1 }] as User[];
      usersRepository.findAll.mockResolvedValue({ data: users, total: 1 });

      const result = await service.findAll();

      expect(usersRepository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({ data: users, total: 1 });
    });

    it('should return paginated users with custom page and limit', async () => {
      const users = [{ id: 3 }, { id: 4 }] as User[];
      usersRepository.findAll.mockResolvedValue({ data: users, total: 10 });

      const result = await service.findAll(2, 5);

      expect(usersRepository.findAll).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual({ data: users, total: 10 });
      expect(result.total).toBe(10);
    });

    it('should calculate skip correctly for page 3 with limit 20', async () => {
      const users = [{ id: 41 }, { id: 42 }] as User[];
      usersRepository.findAll.mockResolvedValue({ data: users, total: 100 });

      const result = await service.findAll(3, 20);

      expect(usersRepository.findAll).toHaveBeenCalledWith(3, 20);
      expect(result.total).toBe(100);
    });

    it('should return empty array when no users found', async () => {
      usersRepository.findAll.mockResolvedValue({ data: [], total: 0 });

      const result = await service.findAll(1, 10);

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('findOne', () => {
    it('should return a user by username', async () => {
      const user = { id: 1, username: 'testuser' } as User;
      usersRepository.findOneByUsername.mockResolvedValue(user);
      const result = await service.findOne('testuser');
      expect(usersRepository.findOneByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      usersRepository.findOneByUsername.mockResolvedValue(null);
      const result = await service.findOne('nonexistent');
      expect(usersRepository.findOneByUsername).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, username: 'testuser' } as User;
      usersRepository.findOneById.mockResolvedValue(user);
      const result = await service.findOneById(1);
      expect(usersRepository.findOneById).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      usersRepository.findOneById.mockResolvedValue(null);
      const result = await service.findOneById(999);
      expect(usersRepository.findOneById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user and assign a role', async () => {
      const dto: CreateUserDto = {
        username: 'test',
        password: '123456',
        roleId: 1,
      } as any;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createdUser = { id: 1, username: 'test', password: 'hashed-password' } as User;

      usersRepository.create.mockResolvedValue(createdUser);
      usersRepository.createUserRole.mockResolvedValue({ userId: 1, roleId: 1 } as UserRole);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(usersRepository.create).toHaveBeenCalledWith({
        username: 'test',
        password: 'hashed-password',
      });
      expect(usersRepository.createUserRole).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(createdUser);
    });

    it('should create a user without role', async () => {
      const dto: CreateUserDto = {
        username: 'test',
        password: '123456',
      } as any;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createdUser = { id: 1 } as User;
      usersRepository.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(usersRepository.createUserRole).not.toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });

    it('should create a user with all fields', async () => {
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'Password123!',
        roleId: 2,
      } as any;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createdUser = {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'hashed-password',
      } as User;

      usersRepository.create.mockResolvedValue(createdUser);
      usersRepository.createUserRole.mockResolvedValue({ userId: 2, roleId: 2 } as UserRole);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(usersRepository.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'hashed-password',
      });
      expect(usersRepository.createUserRole).toHaveBeenCalledWith(2, 2);
      expect(result).toEqual(createdUser);
    });

    it('should create user and save role in correct order', async () => {
      const dto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        roleId: 3,
      } as any;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createdUser = { id: 5, username: 'testuser' } as User;

      usersRepository.create.mockResolvedValue(createdUser);
      usersRepository.createUserRole.mockResolvedValue({ userId: 5, roleId: 3 } as UserRole);

      const result = await service.create(dto);

      const createOrder = usersRepository.create.mock.invocationCallOrder[0];
      const roleCreateOrder = usersRepository.createUserRole.mock.invocationCallOrder[0];
      expect(createOrder).toBeLessThan(roleCreateOrder);
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update user and role', async () => {
      const dto: UpdateUserDto = {
        password: 'newpass',
        roleId: 2,
      } as any;

      const user = { id: 1 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-pass');
      usersRepository.findUserRoleByUserId.mockResolvedValue({ id: 10, userId: 1 } as UserRole);
      usersRepository.update.mockResolvedValue(undefined);
      usersRepository.updateUserRole.mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        password: 'hashed-new-pass',
      });
      expect(usersRepository.updateUserRole).toHaveBeenCalledWith(10, 2);
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      usersRepository.findOneById.mockResolvedValue(null);

      const result = await service.update(1, {} as UpdateUserDto);

      expect(result).toBeNull();
    });

    it('should update user without password', async () => {
      const dto: UpdateUserDto = {
        firstName: 'Updated',
        email: 'updated@example.com',
        roleId: 2,
      } as any;

      const user = { id: 1 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      usersRepository.findUserRoleByUserId.mockResolvedValue({ id: 10, userId: 1 } as UserRole);
      usersRepository.update.mockResolvedValue(undefined);
      usersRepository.updateUserRole.mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        firstName: 'Updated',
        email: 'updated@example.com',
      });
      expect(usersRepository.updateUserRole).toHaveBeenCalledWith(10, 2);
      expect(result).toEqual(user);
    });

    it('should update user without roleId', async () => {
      const dto: UpdateUserDto = {
        password: 'newpass',
        firstName: 'Updated',
      } as any;

      const user = { id: 1 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-pass');
      usersRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        password: 'hashed-new-pass',
        firstName: 'Updated',
      });
      expect(usersRepository.findUserRoleByUserId).not.toHaveBeenCalled();
      expect(usersRepository.createUserRole).not.toHaveBeenCalled();
      expect(usersRepository.updateUserRole).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should create new userRole when it does not exist', async () => {
      const dto: UpdateUserDto = {
        roleId: 3,
      } as any;

      const user = { id: 1 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      usersRepository.findUserRoleByUserId.mockResolvedValue(null);
      usersRepository.createUserRole.mockResolvedValue({ id: 20, userId: 1, roleId: 3 } as UserRole);
      usersRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(usersRepository.findUserRoleByUserId).toHaveBeenCalledWith(1);
      expect(usersRepository.createUserRole).toHaveBeenCalledWith(1, 3);
      expect(usersRepository.updateUserRole).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should update only password without roleId', async () => {
      const dto: UpdateUserDto = {
        password: 'newpassword123',
      } as any;

      const user = { id: 1 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        password: 'hashed-password',
      });
      expect(usersRepository.findUserRoleByUserId).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should update only roleId without password', async () => {
      const dto: UpdateUserDto = {
        roleId: 5,
      } as any;

      const user = { id: 1 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      usersRepository.findUserRoleByUserId.mockResolvedValue({ id: 15, userId: 1 } as UserRole);
      usersRepository.update.mockResolvedValue(undefined);
      usersRepository.updateUserRole.mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(1, {});
      expect(usersRepository.updateUserRole).toHaveBeenCalledWith(15, 5);
      expect(result).toEqual(user);
    });

    it('should update user with all fields except password and roleId', async () => {
      const dto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
      } as any;

      const user = { id: 2 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      usersRepository.update.mockResolvedValue(undefined);

      const result = await service.update(2, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(2, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
      });
      expect(usersRepository.findUserRoleByUserId).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should update user with empty dto', async () => {
      const dto: UpdateUserDto = {} as any;
      const user = { id: 3 } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      usersRepository.update.mockResolvedValue(undefined);

      const result = await service.update(3, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(3, {});
      expect(usersRepository.findUserRoleByUserId).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should call findOneById twice - once to check existence and once to return updated user', async () => {
      const dto: UpdateUserDto = {
        firstName: 'Updated',
      } as any;

      const user = { id: 1, firstName: 'Updated' } as User;

      usersRepository.findOneById.mockResolvedValue(user);
      usersRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(usersRepository.findOneById).toHaveBeenCalledTimes(2);
      expect(usersRepository.findOneById).toHaveBeenNthCalledWith(1, 1);
      expect(usersRepository.findOneById).toHaveBeenNthCalledWith(2, 1);
      expect(result).toEqual(user);
    });
  });

  describe('remove', () => {
    it('should delete user and roles', async () => {
      usersRepository.softDeleteUserRoles.mockResolvedValue(undefined);
      usersRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(usersRepository.softDeleteUserRoles).toHaveBeenCalledWith(1);
      expect(usersRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should delete roles before deleting user', async () => {
      usersRepository.softDeleteUserRoles.mockResolvedValue(undefined);
      usersRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(42);

      expect(usersRepository.softDeleteUserRoles).toHaveBeenCalledWith(42);
      expect(usersRepository.softDelete).toHaveBeenCalledWith(42);
      
      const rolesDeleteOrder = usersRepository.softDeleteUserRoles.mock.invocationCallOrder[0];
      const userDeleteOrder = usersRepository.softDelete.mock.invocationCallOrder[0];
      expect(rolesDeleteOrder).toBeLessThan(userDeleteOrder);
    });

    it('should handle deletion of non-existent user', async () => {
      usersRepository.softDeleteUserRoles.mockResolvedValue(undefined);
      usersRepository.softDelete.mockResolvedValue(undefined);

      await service.remove(999);

      expect(usersRepository.softDeleteUserRoles).toHaveBeenCalledWith(999);
      expect(usersRepository.softDelete).toHaveBeenCalledWith(999);
    });
  });

});