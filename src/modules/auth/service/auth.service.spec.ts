import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/service/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const username = 'testuser';
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      const user: User = {
        id: 1,
        username,
        password: hashedPassword,
        email: 'test@example.com',
        isActive: true,
      } as User;

      usersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(username, password);

      expect(usersService.findOne).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: 1,
        username,
        email: 'test@example.com',
        isActive: true,
      });
      expect(result.password).toBeUndefined();
    });

    it('should return null when user is not found', async () => {
      const username = 'nonexistent';
      const password = 'password123';

      usersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser(username, password);

      expect(usersService.findOne).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const hashedPassword = 'hashed-password';

      const user: User = {
        id: 1,
        username,
        password: hashedPassword,
        email: 'test@example.com',
      } as User;

      usersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(username, password);

      expect(usersService.findOne).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBeNull();
    });

    it('should return null when user exists but password comparison fails', async () => {
      const username = 'testuser';
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      const user: User = {
        id: 1,
        username,
        password: hashedPassword,
      } as User;

      usersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(username, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info with role when user has roles', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        isActive: true,
        userRoles: [
          {
            role: {
              name: 'ADMIN',
            },
          },
        ],
      };

      const token = 'jwt-token';
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
      expect(result).toEqual({
        access_token: token,
        user: {
          isActive: true,
          role: 'ADMIN',
        },
      });
    });

    it('should return access token and user info with null role when user has no roles', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        isActive: true,
        userRoles: [],
      };

      const token = 'jwt-token';
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
      expect(result).toEqual({
        access_token: token,
        user: {
          isActive: true,
          role: null,
        },
      });
    });

    it('should return access token and user info with null role when userRoles is undefined', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        isActive: false,
      };

      const token = 'jwt-token';
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
      expect(result).toEqual({
        access_token: token,
        user: {
          isActive: false,
          role: null,
        },
      });
    });

    it('should handle user with multiple roles and return first role', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        isActive: true,
        userRoles: [
          {
            role: {
              name: 'ADMIN',
            },
          },
          {
            role: {
              name: 'USER',
            },
          },
        ],
      };

      const token = 'jwt-token';
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(result.user.role).toBe('ADMIN');
    });
  });
});
