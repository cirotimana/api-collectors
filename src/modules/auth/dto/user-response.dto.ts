import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 53 })
  id: number;

  @ApiProperty({ example: 'user.example' })
  username: string;

  @ApiProperty({ example: 'User', required: false })
  firstName?: string;

  @ApiProperty({ example: 'Example', required: false })
  lastName?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  email?: string;

  @ApiProperty({ example: 'administrator', required: false })
  role?: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
