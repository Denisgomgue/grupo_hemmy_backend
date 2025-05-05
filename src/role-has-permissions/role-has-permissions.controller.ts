import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleHasPermissionsService } from './role-has-permissions.service';
import { CreateRoleHasPermissionDto } from './dto/create-role-has-permission.dto';
import { UpdateRoleHasPermissionDto } from './dto/update-role-has-permission.dto';

@Controller('role-has-permissions')
export class RoleHasPermissionsController {
  constructor(private readonly roleHasPermissionsService: RoleHasPermissionsService) {}

  @Post()
  create(@Body() createRoleHasPermissionDto: CreateRoleHasPermissionDto) {
    return this.roleHasPermissionsService.create(createRoleHasPermissionDto);
  }

  @Get()
  findAll() {
    return this.roleHasPermissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleHasPermissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleHasPermissionDto: UpdateRoleHasPermissionDto) {
    return this.roleHasPermissionsService.update(+id, updateRoleHasPermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleHasPermissionsService.remove(+id);
  }
}
