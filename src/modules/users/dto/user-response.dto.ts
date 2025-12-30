import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'The ID of the user' })
  id: number;

  @ApiProperty({ example: 'johndoe', description: 'The username of the user' })
  username: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the user' })
  email: string;

  @ApiProperty({ example: 'admin', description: 'The role of the user', required: false })
  role?: string;

  @ApiProperty({ example: true, description: 'Whether the user is active' })
  isActive: boolean;
}
