import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserRole } from '../../../entities/user-role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let userRolesRepository: jest.Mocked<Repository<UserRole>>;

  const mockUsersRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })

  const mockUserRolesRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    userRolesRepository = module.get(getRepositoryToken(UserRole));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });



  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: 1 }, { id: 2 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 2]);

      const result = await service.findAll(1, 10);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual({ data: users, total: 2 });
      expect(result.data).toHaveLength(2);
    });

    it('should return paginated users with default values', async () => {
      const users = [{ id: 1 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll();

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual({ data: users, total: 1 });
    });

    it('should return paginated users with custom page and limit', async () => {
      const users = [{ id: 3 }, { id: 4 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 10]);

      const result = await service.findAll(2, 5);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result).toEqual({ data: users, total: 10 });
      expect(result.total).toBe(10);
    });

    it('should calculate skip correctly for page 3 with limit 20', async () => {
      const users = [{ id: 41 }, { id: 42 }] as User[];
      usersRepository.findAndCount.mockResolvedValue([users, 100]);

      const result = await service.findAll(3, 20);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        skip: 40,
        take: 20,
        order: { createdAt: 'DESC' },
        relations: ['userRoles', 'userRoles.role'],
      });
      expect(result.total).toBe(100);
    });

    it('should return empty array when no users found', async () => {
      usersRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('findOne', () => {
    it('should return a user by username', async () => {
      const user = { id: 1, username: 'testuser' } as User;
      usersRepository.findOne.mockResolvedValue(user);
      const result = await service.findOne('testuser');
      expect(usersRepository.findOne).toHaveBeenCalledWith({ 
        where: { username: 'testuser' },
        relations: ['userRoles', 'userRoles.role'] });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.findOne('nonexistent');
      expect(usersRepository.findOne).toHaveBeenCalledWith({ 
        where: { username: 'nonexistent' },
        relations: ['userRoles', 'userRoles.role'] });
      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, username: 'testuser' } as User;
      usersRepository.findOne.mockResolvedValue(user);
      const result = await service.findOneById(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ 
        where: { id: 1 }, 
        relations: ['userRoles', 'userRoles.role'] });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.findOneById(999);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ 
        where: { id: 999 }, 
        relations: ['userRoles', 'userRoles.role'] });
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

      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);
      userRolesRepository.create.mockReturnValue({ userId: 1, roleId: 1 } as UserRole);
      userRolesRepository.save.mockResolvedValue({} as UserRole);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(userRolesRepository.create).toHaveBeenCalledWith({
        userId: 1,
        roleId: 1,
      });
      expect(result).toEqual(createdUser);
    });

    it('should create a user without role', async () => {
      const dto: CreateUserDto = {
        username: 'test',
        password: '123456',
      } as any;

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createdUser = { id: 1 } as User;
      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(userRolesRepository.create).not.toHaveBeenCalled();
      expect(userRolesRepository.save).not.toHaveBeenCalled();
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

      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);
      userRolesRepository.create.mockReturnValue({ userId: 2, roleId: 2 } as UserRole);
      userRolesRepository.save.mockResolvedValue({} as UserRole);

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(usersRepository.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'hashed-password',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(userRolesRepository.create).toHaveBeenCalledWith({
        userId: 2,
        roleId: 2,
      });
      expect(userRolesRepository.save).toHaveBeenCalled();
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
      const userRole = { userId: 5, roleId: 3 } as UserRole;

      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);
      userRolesRepository.create.mockReturnValue(userRole);
      userRolesRepository.save.mockResolvedValue(userRole);

      const result = await service.create(dto);

      const saveOrder = usersRepository.save.mock.invocationCallOrder[0];
      const roleSaveOrder = userRolesRepository.save.mock.invocationCallOrder[0];
      expect(saveOrder).toBeLessThan(roleSaveOrder);
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

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-pass');

      userRolesRepository.findOne.mockResolvedValue({ id: 10, userId: 1 } as UserRole);

      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(1, dto);

      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        password: 'hashed-new-pass',
      });
      expect(userRolesRepository.update).toHaveBeenCalledWith(10, {
        roleId: 2,
      });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null);

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

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      userRolesRepository.findOne.mockResolvedValue({ id: 10, userId: 1 } as UserRole);
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(1, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        firstName: 'Updated',
        email: 'updated@example.com',
      });
      expect(userRolesRepository.update).toHaveBeenCalledWith(10, {
        roleId: 2,
      });
      expect(result).toEqual(user);
    });

    it('should update user without roleId', async () => {
      const dto: UpdateUserDto = {
        password: 'newpass',
        firstName: 'Updated',
      } as any;

      const user = { id: 1 } as User;

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-pass');
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(1, dto);

      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        password: 'hashed-new-pass',
        firstName: 'Updated',
      });
      expect(userRolesRepository.findOne).not.toHaveBeenCalled();
      expect(userRolesRepository.create).not.toHaveBeenCalled();
      expect(userRolesRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should create new userRole when it does not exist', async () => {
      const dto: UpdateUserDto = {
        roleId: 3,
      } as any;

      const user = { id: 1 } as User;
      const newUserRole = { id: 20, userId: 1, roleId: 3 } as UserRole;

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      userRolesRepository.findOne.mockResolvedValue(null);
      userRolesRepository.create.mockReturnValue(newUserRole);
      userRolesRepository.save.mockResolvedValue(newUserRole);
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(1, dto);

      expect(userRolesRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(userRolesRepository.create).toHaveBeenCalledWith({
        userId: 1,
        roleId: 3,
      });
      expect(userRolesRepository.save).toHaveBeenCalledWith(newUserRole);
      expect(userRolesRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should update only password without roleId', async () => {
      const dto: UpdateUserDto = {
        password: 'newpassword123',
      } as any;

      const user = { id: 1 } as User;

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(1, dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(usersRepository.update).toHaveBeenCalledWith(1, {
        password: 'hashed-password',
      });
      expect(userRolesRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should update only roleId without password', async () => {
      const dto: UpdateUserDto = {
        roleId: 5,
      } as any;

      const user = { id: 1 } as User;

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      userRolesRepository.findOne.mockResolvedValue({ id: 15, userId: 1 } as UserRole);
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(1, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(1, {});
      expect(userRolesRepository.update).toHaveBeenCalledWith(15, {
        roleId: 5,
      });
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

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(2, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(2, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
      });
      expect(userRolesRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should update user with empty dto', async () => {
      const dto: UpdateUserDto = {} as any;
      const user = { id: 3 } as User;

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(3, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(3, {});
      expect(userRolesRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('should call findOneById twice - once to check existence and once to return updated user', async () => {
      const dto: UpdateUserDto = {
        firstName: 'Updated',
      } as any;

      const user = { id: 1, firstName: 'Updated' } as User;

      jest.spyOn(service, 'findOneById').mockResolvedValue(user);
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(user).mockResolvedValueOnce(user);

      const result = await service.update(1, dto);

      expect(service.findOneById).toHaveBeenCalledTimes(2);
      expect(service.findOneById).toHaveBeenNthCalledWith(1, 1);
      expect(service.findOneById).toHaveBeenNthCalledWith(2, 1);
      expect(result).toEqual(user);
    });
  });

  describe('remove', () => {
    it('should delete user and roles', async () => {
      await service.remove(1);

      expect(userRolesRepository.delete).toHaveBeenCalledWith({ userId: 1 });
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should delete roles before deleting user', async () => {
      await service.remove(42);

      expect(userRolesRepository.delete).toHaveBeenCalledWith({ userId: 42 });
      expect(usersRepository.delete).toHaveBeenCalledWith(42);
      
      const rolesDeleteOrder = userRolesRepository.delete.mock.invocationCallOrder[0];
      const userDeleteOrder = usersRepository.delete.mock.invocationCallOrder[0];
      expect(rolesDeleteOrder).toBeLessThan(userDeleteOrder);
    });

    it('should handle deletion of non-existent user', async () => {
      userRolesRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);
      usersRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await service.remove(999);

      expect(userRolesRepository.delete).toHaveBeenCalledWith({ userId: 999 });
      expect(usersRepository.delete).toHaveBeenCalledWith(999);
    });
  });

});