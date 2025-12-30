import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../../users/service/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      console.log(`User not found: ${username}`);
      return null;
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${username}`);
      console.log(`Provided: ${pass}`);
      console.log(`Stored: ${user.password}`);
    }
    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    
    console.log('Login user:', JSON.stringify(user));
    const role = user.userRoles && user.userRoles.length > 0 ? user.userRoles[0].role.name : null;
    console.log('Detected role:', role);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        isActive: user.isActive,
        role: role,
      },
    };
  }

  async getCurrentUser(userId: number): Promise<UserResponseDto> {
    // Fetch user from database to get fresh data
    const user = await this.usersService.findOneById(userId);

    // User not found (deleted)
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // User is inactive
    if (!user.isActive) {
      throw new ForbiddenException('Usuario inactivo');
    }

    // Extract role from userRoles relation
    const role = user.userRoles && user.userRoles.length > 0 
      ? user.userRoles[0].role.name 
      : undefined;

    // Build response DTO
    const response: UserResponseDto = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: role,
      isActive: user.isActive,
    };

    return response;
  }
}

