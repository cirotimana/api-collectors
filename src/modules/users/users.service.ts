import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PAGINATION } from '../../common/constants/constants';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../entities/user-role.entity';

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

  async findAll(page: number = PAGINATION.DEFAULT_PAGE, limit: number = PAGINATION.DEFAULT_LIMIT): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      where: { deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['userRoles', 'userRoles.role'],
    });

    return { data, total };
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { username, deletedAt: IsNull() },
      relations: ['userRoles', 'userRoles.role']
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id, deletedAt: IsNull() },
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
      // Buscar rol de usuario existente
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
    //await this.userRolesRepository.delete({ userId: id }); // Limpiar roles primero
    await this.userRolesRepository.update({ userId: id }, { deletedAt: new Date() });
    
    // Soft delete: cambiar estado a false y establecer fecha de eliminacion
    await this.usersRepository.update(id, {
      isActive: false,
      deletedAt: new Date(),
    });
  }
}

