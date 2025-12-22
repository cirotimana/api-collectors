import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repository/users.repository';
import { PAGINATION } from '../../../common/constants/constants';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, roleId, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const savedUser = await this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    if (roleId) {
      await this.usersRepository.createUserRole(savedUser.id, roleId);
    }

    return savedUser;
  }

  async findAll(page: number = PAGINATION.DEFAULT_PAGE, limit: number = PAGINATION.DEFAULT_LIMIT): Promise<{ data: User[]; total: number }> {
    return this.usersRepository.findAll(page, limit);
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOneByUsername(username);
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOneById(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findOneById(id);
    if (!user) return null;

    const { roleId, ...updateData } = updateUserDto;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.usersRepository.update(id, updateData);

    if (roleId) {
      const existingUserRole = await this.usersRepository.findUserRoleByUserId(id);
      if (existingUserRole) {
        await this.usersRepository.updateUserRole(existingUserRole.id, roleId);
      } else {
        await this.usersRepository.createUserRole(id, roleId);
      }
    }

    return this.findOneById(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.softDeleteUserRoles(id);
    await this.usersRepository.softDelete(id);
  }
}

