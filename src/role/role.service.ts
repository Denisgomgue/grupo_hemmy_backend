import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { RoleHasPermission } from 'src/role-has-permissions/entities/role-has-permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RoleHasPermission)
    private readonly roleHasPermissionRepository: Repository<RoleHasPermission>,
  ) { }

  async findOne(id: number) {
    return this.roleRepository.findOne({
      where: { id },
      relations: [ 'role_has_permissions', 'role_has_permissions.permission' ],
    });
  }

  async create(CreateRoleDto: CreateRoleDto) {
    const { role_has_permissions, ...data } = CreateRoleDto;

    const role = await this.roleRepository.save({
      allowAll: data.allowAll,
      description: data.description,
      isPublic: data.isPublic,
      name: data.name,
    });

    const roleHasPermissions = await Promise.all(
      role_has_permissions.map(async (item) => {
        const permission = await this.permissionRepository.findOne({
          where: { id: item.permissionId },
        });

        return this.roleHasPermissionRepository.save({
          name: item.name,
          routeCode: item.routeCode,
          actions: item.actions,
          restrictions: item.restrictions,
          isSubRoute: item.isSubRoute,
          permission,
          role: role,
        });
      })
    );

    return { ...role, role_has_permissions: roleHasPermissions };
  }

  async findAll() {
    const roles = await this.roleRepository.find({
      relations: [ 'role_has_permissions', 'role_has_permissions.permission' ],
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      allowAll: role.allowAll,
      isPublic: role.isPublic,
      role_has_permissions: (role.role_has_permissions || []).map((rolePermission) => ({
        id: rolePermission.id,
        name: rolePermission.name || '',
        routeCode: rolePermission.routeCode || '',
        actions: rolePermission.actions || [],
        restrictions: rolePermission.restrictions || [],
        isSubRoute: rolePermission.isSubRoute || false,
        permissionId: rolePermission.permission?.id || null,
        createdAt: rolePermission.created_at,
        updatedAt: rolePermission.updated_at,
      })),
    }));
  }

  async update(id: number, updateProfileDto: UpdateRoleDto) {
    const { role_has_permissions, ...data } = updateProfileDto;

    const role = await this.roleRepository.findOne({
      where: { id },
      relations: [ 'role_has_permissions', 'role_has_permissions.permission' ],
    });

    if (!role) {
      throw new Error(`Profile with id ${id} not found`);
    }

    Object.assign(role, data);
    await this.roleRepository.save(role);

    await this.roleHasPermissionRepository.delete({ role: { id } });

    const updatedRoleHasPermissions = await Promise.all(
      role_has_permissions.map(async (item) => {
        const permission = await this.permissionRepository.findOne({
          where: { id: item.permissionId },
        });

        return this.roleHasPermissionRepository.save({
          name: item.name,
          routeCode: item.routeCode,
          actions: item.actions,
          restrictions: item.restrictions,
          isSubRoute: item.isSubRoute,
          permission,
          role: role,
        });
      }),
    );

    return { ...role, role_has_permissions: updatedRoleHasPermissions };
  }

  async remove(id: number) {
    await this.roleHasPermissionRepository.delete({ role: { id } });

    return this.roleRepository.delete(id);
  }

  async getSummary() {
    try {
      const roles = await this.findAll();

      const summary = {
        total: roles.length,
        active: roles.filter(role => role.role_has_permissions && role.role_has_permissions.length > 0).length,
        inactive: roles.filter(role => !role.role_has_permissions || role.role_has_permissions.length === 0).length,
        publicRoles: roles.filter(role => role.isPublic).length,
        privateRoles: roles.filter(role => !role.isPublic).length,
        rolesWithPermissions: roles.filter(role => role.role_has_permissions && role.role_has_permissions.length > 0).length,
        rolesWithoutPermissions: roles.filter(role => !role.role_has_permissions || role.role_has_permissions.length === 0).length,
      };

      return summary;
    } catch (error) {
      console.error('Error in getSummary:', error);
      throw error;
    }
  }
}
