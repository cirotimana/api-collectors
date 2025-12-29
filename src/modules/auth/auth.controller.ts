import { Controller, Request, Post, Get, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBody, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener informacion del usuario autenticado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informacion del usuario obtenida exitosamente',
    type: UserResponseDto 
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token invalido o ausente' })
  @ApiResponse({ status: 403, description: 'Usuario inactivo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }
}
