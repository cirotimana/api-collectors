import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, roleId, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    const savedUser = await this.usersRepository.save(user);

    if (roleId) {
      const userRole = this.userRolesRepository.create({
        userId: savedUser.id,
        roleId: roleId,
      });
      await this.userRolesRepository.save(userRole);
    }

    return savedUser;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['userRoles', 'userRoles.role'],
    });

    return { data, total };
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { username },
      relations: ['userRoles', 'userRoles.role']
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['userRoles', 'userRoles.role']
    });
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
      // Check if user already has a role, if so update it, else create new
      // Assuming single role per user for simplicity based on request "asigne un rol"
      // But table is many-to-many. I'll clear existing roles and add new one to enforce single role if that's the logic,
      // or just add it. The request says "este se cree en users_roles o se edite si es que ya esiste con otro rol".
      // This implies 1 user - 1 role logic effectively, or replacing the role.
      
      // Let's find existing user role
      const existingUserRole = await this.userRolesRepository.findOne({ where: { userId: id } });
      if (existingUserRole) {
        await this.userRolesRepository.update(existingUserRole.id, { roleId });
      } else {
        const userRole = this.userRolesRepository.create({
          userId: id,
          roleId: roleId,
        });
        await this.userRolesRepository.save(userRole);
      }
    }

    return this.findOneById(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRolesRepository.delete({ userId: id }); // Clean up roles first
    await this.usersRepository.delete(id);
  }
}

