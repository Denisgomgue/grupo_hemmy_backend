import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  findAll() {
    return this.permissionRepository.find();
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.permissionRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.permissionRepository.delete(id);
  }
}