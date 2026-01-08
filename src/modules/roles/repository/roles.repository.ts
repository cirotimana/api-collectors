import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.rolesRepository.create(roleData);
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({ where: { deletedAt: IsNull() } });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async update(id: number, updateData: Partial<Role>): Promise<void> {
    await this.rolesRepository.update(id, updateData);
  }

  async softDelete(id: number): Promise<void> {
    await this.rolesRepository.update(id, { deletedAt: new Date() });
  }
}

