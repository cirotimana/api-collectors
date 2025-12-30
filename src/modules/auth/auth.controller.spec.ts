import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './service/auth.service';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token and user info when credentials are valid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const validatedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        isActive: true,
        userRoles: [
          {
            role: {
              name: 'ADMIN',
            },
          },
        ],
      };

      const loginResponse = {
        access_token: 'jwt-token',
        user: {
          isActive: true,
          role: 'ADMIN',
        },
      };

      service.validateUser.mockResolvedValue(validatedUser);
      service.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(service.login).toHaveBeenCalledWith(validatedUser);
      expect(result).toEqual(loginResponse);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const loginDto: LoginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      service.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(service.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      service.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(service.login).not.toHaveBeenCalled();
    });

    it('should handle login with user without roles', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const validatedUser = {
        id: 1,
        username: 'testuser',
        isActive: true,
        userRoles: [],
      };

      const loginResponse = {
        access_token: 'jwt-token',
        user: {
          isActive: true,
          role: null,
        },
      };

      service.validateUser.mockResolvedValue(validatedUser);
      service.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(service.login).toHaveBeenCalledWith(validatedUser);
      expect(result).toEqual(loginResponse);
    });
  });
});
