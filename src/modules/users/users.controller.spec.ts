import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './service/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PAGINATION } from 'src/common/constants/constants';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'Password123!',
        roleId: 1,
      };

      const expectedUser: User = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      service.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should create a user without roleId', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: 'Password123!',
      };

      const expectedUser: User = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      service.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with default values', async () => {
      const users: User[] = [
        { id: 1, username: 'user1' } as User,
        { id: 2, username: 'user2' } as User,
      ];
      const expectedResult = { data: users, total: 2 };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(PAGINATION.DEFAULT_PAGE, PAGINATION.DEFAULT_LIMIT);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated users with custom page and limit', async () => {
      const users: User[] = [
        { id: 3, username: 'user3' } as User,
        { id: 4, username: 'user4' } as User,
      ];
      const expectedResult = { data: users, total: 10 };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(2, 5);

      expect(service.findAll).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array when no users found', async () => {
      const expectedResult = { data: [], total: 0 };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });

    it('should use default page value when undefined', async () => {
      const users: User[] = [{ id: 1, username: 'user1' } as User];
      const expectedResult = { data: users, total: 1 };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(undefined, 10);

      expect(service.findAll).toHaveBeenCalledWith(PAGINATION.DEFAULT_PAGE, 10);
      expect(result).toEqual(expectedResult);
    });

    it('should use default limit value when undefined', async () => {
      const users: User[] = [{ id: 1, username: 'user1' } as User];
      const expectedResult = { data: users, total: 1 };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, undefined);

      expect(service.findAll).toHaveBeenCalledWith(1, PAGINATION.DEFAULT_LIMIT);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      const expectedUser: User = {
        id: 1,
        username: 'johndoe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      } as User;

      service.findOneById.mockResolvedValue(expectedUser);

      const result = await controller.findOne(userId);

      expect(service.findOneById).toHaveBeenCalledWith(1);
      expect(service.findOneById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should convert string id to number correctly', async () => {
      const userId = '123';
      const expectedUser: User = {
        id: 123,
        username: 'testuser',
      } as User;

      service.findOneById.mockResolvedValue(expectedUser);

      const result = await controller.findOne(userId);

      expect(service.findOneById).toHaveBeenCalledWith(123);
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      const userId = '999';

      service.findOneById.mockResolvedValue(null);

      const result = await controller.findOne(userId);

      expect(service.findOneById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should handle zero as id', async () => {
      const userId = '0';

      service.findOneById.mockResolvedValue(null);

      const result = await controller.findOne(userId);

      expect(service.findOneById).toHaveBeenCalledWith(0);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        firstName: 'John Updated',
        email: 'john.updated@example.com',
      };

      const updatedUser: User = {
        id: 1,
        firstName: 'John Updated',
        lastName: 'Doe',
        email: 'john.updated@example.com',
        username: 'johndoe',
      } as User;

      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
    });

    it('should update user password', async () => {
      const userId = '2';
      const updateUserDto: UpdateUserDto = {
        password: 'NewPassword123!',
      };

      const updatedUser: User = {
        id: 2,
        username: 'janesmith',
        password: 'hashed-new-password',
      } as User;

      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(2, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update user role', async () => {
      const userId = '3';
      const updateUserDto: UpdateUserDto = {
        roleId: 2,
      };

      const updatedUser: User = {
        id: 3,
        username: 'testuser',
      } as User;

      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(3, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user not found', async () => {
      const userId = '999';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      service.update.mockResolvedValue(null);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(999, updateUserDto);
      expect(result).toBeNull();
    });

    it('should handle empty updateUserDto', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {};

      const updatedUser: User = {
        id: 1,
        username: 'johndoe',
      } as User;

      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const userId = '1';

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should delete user with different id', async () => {
      const userId = '42';

      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(42);
      expect(result).toBeUndefined();
    });
  });
});
