import { Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RolesRepository } from '../repository/roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private rolesRepository: RolesRepository,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return this.rolesRepository.create(createRoleDto);
  }

  findAll() {
    return this.rolesRepository.findAll();
  }

  findOne(id: number) {
    return this.rolesRepository.findOne(id);
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.rolesRepository.update(id, updateRoleDto);
  }

  remove(id: number) {
    return this.rolesRepository.softDelete(id);
  }
}
