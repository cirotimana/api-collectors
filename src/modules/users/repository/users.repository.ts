import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../../../entities/user-role.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['userRoles', 'userRoles.role'],
    });

    return { data, total };
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username, deletedAt: IsNull() },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, updateData);
  }

  async softDelete(id: number): Promise<void> {
    await this.usersRepository.update(id, {
      isActive: false,
      deletedAt: new Date(),
    });
  }

  // Métodos para UserRole
  async findUserRoleByUserId(userId: number): Promise<UserRole | null> {
    return this.userRolesRepository.findOne({
      where: { userId },
    });
  }

  async createUserRole(userId: number, roleId: number): Promise<UserRole> {
    const userRole = this.userRolesRepository.create({
      userId,
      roleId,
    });
    return this.userRolesRepository.save(userRole);
  }

  async updateUserRole(userRoleId: number, roleId: number): Promise<void> {
    await this.userRolesRepository.update(userRoleId, { roleId });
  }

  async softDeleteUserRoles(userId: number): Promise<void> {
    await this.userRolesRepository.update(
      { userId },
      { deletedAt: new Date() },
    );
  }
}

