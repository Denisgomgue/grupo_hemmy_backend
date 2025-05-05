import { Injectable } from '@nestjs/common';
import { CreateRoleHasPermissionDto } from './dto/create-role-has-permission.dto';
import { UpdateRoleHasPermissionDto } from './dto/update-role-has-permission.dto';

@Injectable()
export class RoleHasPermissionsService {
  create(createRoleHasPermissionDto: CreateRoleHasPermissionDto) {
    return 'This action adds a new roleHasPermission';
  }

  findAll() {
    return `This action returns all roleHasPermissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roleHasPermission`;
  }

  update(id: number, updateRoleHasPermissionDto: UpdateRoleHasPermissionDto) {
    return `This action updates a #${id} roleHasPermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} roleHasPermission`;
  }
}
