import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleHasPermission } from './entities/role-has-permission.entity';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { CreateRoleHasPermissionDto } from './dto/create-role-has-permission.dto';
import { UpdateRoleHasPermissionDto } from './dto/update-role-has-permission.dto';

@Injectable()
export class RoleHasPermissionsService {
  constructor(
    @InjectRepository(RoleHasPermission)
    private roleHasPermissionRepository: Repository<RoleHasPermission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) { }

  async create(createRoleHasPermissionDto: CreateRoleHasPermissionDto) {
    // Verificar si el rol tiene allowAll
    const role = await this.roleRepository.findOne({
      where: { id: createRoleHasPermissionDto.roleId }
    });

    if (role?.allowAll) {
      throw new ForbiddenException('No se pueden modificar los permisos del Super Administrador');
    }

    // Verificar que el rol y permiso existen
    const permission = await this.permissionRepository.findOne({
      where: { id: createRoleHasPermissionDto.permissionId }
    });

    if (!role || !permission) {
      throw new BadRequestException('Rol o permiso no encontrado');
    }

    const roleHasPermission = this.roleHasPermissionRepository.create({
      role: { id: createRoleHasPermissionDto.roleId },
      permission: { id: createRoleHasPermissionDto.permissionId },
      name: createRoleHasPermissionDto.name,
      routeCode: createRoleHasPermissionDto.routeCode,
      actions: createRoleHasPermissionDto.actions,
      restrictions: createRoleHasPermissionDto.restrictions,
      isSubRoute: createRoleHasPermissionDto.isSubRoute
    });

    return await this.roleHasPermissionRepository.save(roleHasPermission);
  }

  async findAll() {
    return await this.roleHasPermissionRepository.find({
      relations: [ 'role', 'permission' ]
    });
  }

  async findOne(id: number) {
    return await this.roleHasPermissionRepository.findOne({
      where: { id },
      relations: [ 'role', 'permission' ]
    });
  }

  async update(id: number, updateRoleHasPermissionDto: UpdateRoleHasPermissionDto) {
    // Verificar si el rol tiene allowAll
    const existingRoleHasPermission = await this.roleHasPermissionRepository.findOne({
      where: { id },
      relations: [ 'role' ]
    });

    if (existingRoleHasPermission?.role?.allowAll) {
      throw new ForbiddenException('No se pueden modificar los permisos del Super Administrador');
    }

    // Preparar datos para actualización
    const updateData: any = {};

    if (updateRoleHasPermissionDto.roleId) {
      updateData.role = { id: updateRoleHasPermissionDto.roleId };
    }
    if (updateRoleHasPermissionDto.permissionId) {
      updateData.permission = { id: updateRoleHasPermissionDto.permissionId };
    }
    if (updateRoleHasPermissionDto.name !== undefined) {
      updateData.name = updateRoleHasPermissionDto.name;
    }
    if (updateRoleHasPermissionDto.routeCode !== undefined) {
      updateData.routeCode = updateRoleHasPermissionDto.routeCode;
    }
    if (updateRoleHasPermissionDto.actions !== undefined) {
      updateData.actions = updateRoleHasPermissionDto.actions;
    }
    if (updateRoleHasPermissionDto.restrictions !== undefined) {
      updateData.restrictions = updateRoleHasPermissionDto.restrictions;
    }
    if (updateRoleHasPermissionDto.isSubRoute !== undefined) {
      updateData.isSubRoute = updateRoleHasPermissionDto.isSubRoute;
    }

    await this.roleHasPermissionRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number) {
    // Verificar si el rol tiene allowAll
    const existingRoleHasPermission = await this.roleHasPermissionRepository.findOne({
      where: { id },
      relations: [ 'role' ]
    });

    if (existingRoleHasPermission?.role?.allowAll) {
      throw new ForbiddenException('No se pueden modificar los permisos del Super Administrador');
    }

    await this.roleHasPermissionRepository.delete(id);
    return { message: 'RoleHasPermission eliminado exitosamente' };
  }

  // Método para obtener la matriz de permisos por rol
  async getRolePermissionMatrix() {
    const roles = await this.roleRepository.find();
    const permissions = await this.permissionRepository.find();
    const roleHasPermissions = await this.roleHasPermissionRepository.find({
      relations: [ 'role', 'permission' ]
    });

    const matrix = {};

    roles.forEach(role => {
      matrix[ role.name ] = {};

      // Agrupar permisos por routeCode (módulo)
      const permissionsByModule = {};
      permissions.forEach(permission => {
        if (!permissionsByModule[ permission.routeCode ]) {
          permissionsByModule[ permission.routeCode ] = [];
        }
        permissionsByModule[ permission.routeCode ].push(permission);
      });

      // Para cada módulo, verificar permisos
      Object.keys(permissionsByModule).forEach(module => {
        matrix[ role.name ][ module ] = {};

        permissionsByModule[ module ].forEach(permission => {
          // Si el rol tiene allowAll, todos los permisos son true
          if (role.allowAll) {
            matrix[ role.name ][ module ][ permission.name ] = true;
          } else {
            // Verificar si existe la relación
            const hasPermission = roleHasPermissions.some(
              rhp => rhp.role.id === role.id && rhp.permission.id === permission.id
            );
            matrix[ role.name ][ module ][ permission.name ] = hasPermission;
          }
        });
      });
    });

    return matrix;
  }

  // Método para actualizar la matriz de permisos
  async updateRolePermissionMatrix(matrix: any) {
    // Verificar si hay roles con allowAll en la matriz
    for (const roleName in matrix) {
      const role = await this.roleRepository.findOne({ where: { name: roleName } });
      if (role?.allowAll) {
        throw new ForbiddenException(`No se pueden modificar los permisos del rol "${roleName}" (Super Administrador)`);
      }
    }

    // Eliminar todas las relaciones existentes (excepto roles con allowAll)
    const rolesToUpdate = await this.roleRepository.find({ where: { allowAll: false } });
    for (const role of rolesToUpdate) {
      await this.roleHasPermissionRepository.delete({ role: { id: role.id } });
    }

    // Crear nuevas relaciones
    const newRelations = [];
    for (const roleName in matrix) {
      const role = await this.roleRepository.findOne({ where: { name: roleName } });
      if (!role || role.allowAll) continue;

      for (const module in matrix[ roleName ]) {
        for (const permissionName in matrix[ roleName ][ module ]) {
          if (matrix[ roleName ][ module ][ permissionName ]) {
            const permission = await this.permissionRepository.findOne({
              where: { name: permissionName, routeCode: module }
            });

            if (permission) {
              newRelations.push({
                role: { id: role.id },
                permission: { id: permission.id }
              });
            }
          }
        }
      }
    }

    // Guardar todas las nuevas relaciones
    if (newRelations.length > 0) {
      await this.roleHasPermissionRepository.save(newRelations);
    }

    return { message: 'Matriz de permisos actualizada exitosamente' };
  }
}
