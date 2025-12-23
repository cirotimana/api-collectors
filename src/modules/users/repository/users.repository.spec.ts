import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UsersRepository } from './users.repository';
import { User } from '../entities/user.entity';
import { UserRole } from '../../../entities/user-role.entity';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let usersRepository: jest.Mocked<Repository<User>>;
  let userRolesRepository: jest.Mocked<Repository<UserRole>>;

  const mockUsersRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  });

  const mockUserRolesRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useFactory: mockUserRolesRepository,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    usersRepository = module.get(getRepositoryToken(User));
    userRolesRepository = module.get(getRepositoryToken(UserRole));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users with default values', async () => {
      const users = [{ id: 1 }, { id: 2 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 2]);

      const result = await repository.findAll();

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual({ data: users, total: 2 });
      expect(result.data).toHaveLength(2);
    });

    it('should return paginated users with custom page and limit', async () => {
      const users = [{ id: 3 }, { id: 4 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 10]);

      const result = await repository.findAll(2, 5);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        skip: 5,
        take: 5,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual({ data: users, total: 10 });
    });

    it('should calculate skip correctly for page 3 with limit 20', async () => {
      const users = [{ id: 41 }, { id: 42 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 100]);

      const result = await repository.findAll(3, 20);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        skip: 40,
        take: 20,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result.total).toBe(100);
    });

    it('should return empty array when no users found', async () => {
      usersRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await repository.findAll(1, 10);

      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should handle page 1 correctly', async () => {
      const users = [{ id: 1 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await repository.findAll(1, 10);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual({ data: users, total: 1 });
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', async () => {
      const user = { id: 1, username: 'testuser' } as User;
      usersRepository.findOne.mockResolvedValue(user);

      const result = await repository.findOneByUsername('testuser');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser', deletedAt: IsNull() },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOneByUsername('nonexistent');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nonexistent', deletedAt: IsNull() },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toBeNull();
    });

    it('should handle empty username', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOneByUsername('');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { username: '', deletedAt: IsNull() },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, username: 'testuser' } as User;
      usersRepository.findOne.mockResolvedValue(user);

      const result = await repository.findOneById(1);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: IsNull() },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOneById(999);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999, deletedAt: IsNull() },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toBeNull();
    });

    it('should handle zero as id', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOneById(0);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 0, deletedAt: IsNull() },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData = {
        username: 'testuser',
        password: 'hashed-password',
        email: 'test@example.com',
      } as Partial<User>;

      const createdUser = { id: 1, ...userData } as User;
      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);

      const result = await repository.create(userData);

      expect(usersRepository.create).toHaveBeenCalledWith(userData);
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should create a user with all fields', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'hashed-password',
      } as Partial<User>;

      const createdUser = { id: 2, ...userData } as User;
      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);

      const result = await repository.create(userData);

      expect(usersRepository.create).toHaveBeenCalledWith(userData);
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should handle user creation with minimal data', async () => {
      const userData = {
        username: 'minimal',
        password: 'pass',
      } as Partial<User>;

      const createdUser = { id: 3, ...userData } as User;
      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);

      const result = await repository.create(userData);

      expect(usersRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = {
        firstName: 'Updated',
        email: 'updated@example.com',
      } as Partial<User>;

      usersRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(1, updateData);

      expect(usersRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(usersRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update user password', async () => {
      const updateData = {
        password: 'new-hashed-password',
      } as Partial<User>;

      usersRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(1, updateData);

      expect(usersRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle update with empty data', async () => {
      const updateData = {} as Partial<User>;

      usersRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.update(1, updateData);

      expect(usersRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should update user with multiple fields', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
      } as Partial<User>;

      usersRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.update(2, updateData);

      expect(usersRepository.update).toHaveBeenCalledWith(2, updateData);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user', async () => {
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      usersRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.softDelete(1);

      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        isActive: false,
        deletedAt: mockDate,
      });
      expect(usersRepository.update).toHaveBeenCalledTimes(1);

      jest.restoreAllMocks();
    });

    it('should handle soft delete of non-existent user', async () => {
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      usersRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.softDelete(999);

      expect(usersRepository.update).toHaveBeenCalledWith(999, {
        isActive: false,
        deletedAt: mockDate,
      });

      jest.restoreAllMocks();
    });
  });

  describe('findUserRoleByUserId', () => {
    it('should return a user role by user id', async () => {
      const userRole = { id: 1, userId: 1, roleId: 2 } as UserRole;
      userRolesRepository.findOne.mockResolvedValue(userRole);

      const result = await repository.findUserRoleByUserId(1);

      expect(userRolesRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toEqual(userRole);
    });

    it('should return null when user role not found', async () => {
      userRolesRepository.findOne.mockResolvedValue(null);

      const result = await repository.findUserRoleByUserId(999);

      expect(userRolesRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('createUserRole', () => {
    it('should create a user role', async () => {
      const createdUserRole = { id: 1, userId: 1, roleId: 2 } as UserRole;

      userRolesRepository.create.mockReturnValue(createdUserRole);
      userRolesRepository.save.mockResolvedValue(createdUserRole);

      const result = await repository.createUserRole(1, 2);

      expect(userRolesRepository.create).toHaveBeenCalledWith({
        userId: 1,
        roleId: 2,
      });
      expect(userRolesRepository.save).toHaveBeenCalledWith(createdUserRole);
      expect(result).toEqual(createdUserRole);
    });

    it('should create user role with different ids', async () => {
      const createdUserRole = { id: 5, userId: 10, roleId: 3 } as UserRole;

      userRolesRepository.create.mockReturnValue(createdUserRole);
      userRolesRepository.save.mockResolvedValue(createdUserRole);

      const result = await repository.createUserRole(10, 3);

      expect(userRolesRepository.create).toHaveBeenCalledWith({
        userId: 10,
        roleId: 3,
      });
      expect(result).toEqual(createdUserRole);
    });
  });

  describe('updateUserRole', () => {
    it('should update a user role', async () => {
      userRolesRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.updateUserRole(1, 3);

      expect(userRolesRepository.update).toHaveBeenCalledWith(1, { roleId: 3 });
      expect(userRolesRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle update with different role id', async () => {
      userRolesRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.updateUserRole(5, 7);

      expect(userRolesRepository.update).toHaveBeenCalledWith(5, { roleId: 7 });
    });

    it('should handle update of non-existent user role', async () => {
      userRolesRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.updateUserRole(999, 1);

      expect(userRolesRepository.update).toHaveBeenCalledWith(999, {
        roleId: 1,
      });
    });
  });

  describe('softDeleteUserRoles', () => {
    it('should soft delete user roles by user id', async () => {
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      userRolesRepository.update.mockResolvedValue({ affected: 1 } as any);

      await repository.softDeleteUserRoles(1);

      expect(userRolesRepository.update).toHaveBeenCalledWith(
        { userId: 1 },
        { deletedAt: mockDate },
      );
      expect(userRolesRepository.update).toHaveBeenCalledTimes(1);

      jest.restoreAllMocks();
    });

    it('should handle soft delete when no roles exist', async () => {
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      userRolesRepository.update.mockResolvedValue({ affected: 0 } as any);

      await repository.softDeleteUserRoles(999);

      expect(userRolesRepository.update).toHaveBeenCalledWith(
        { userId: 999 },
        { deletedAt: mockDate },
      );

      jest.restoreAllMocks();
    });

    it('should soft delete multiple user roles', async () => {
      const mockDate = new Date('2024-01-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      userRolesRepository.update.mockResolvedValue({ affected: 2 } as any);

      await repository.softDeleteUserRoles(5);

      expect(userRolesRepository.update).toHaveBeenCalledWith(
        { userId: 5 },
        { deletedAt: mockDate },
      );

      jest.restoreAllMocks();
    });
  });
});

