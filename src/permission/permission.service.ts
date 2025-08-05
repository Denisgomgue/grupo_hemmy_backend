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
  ) { }

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const permission = this.permissionRepository.create(createPermissionDto);
      return await this.permissionRepository.save(permission);
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.permissionRepository.find({
        relations: [ 'role_has_permissions', 'resource' ],
      });
    } catch (error) {
      console.error('Error finding permissions:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.permissionRepository.findOne({
        where: { id },
        relations: [ 'role_has_permissions', 'resource' ],
      });
    } catch (error) {
      console.error('Error finding permission:', error);
      throw error;
    }
  }

  // Nuevo método para obtener permisos por recurso
  async findByResourceId(resourceId: number) {
    try {
      return await this.permissionRepository.find({
        where: { resourceId },
        relations: [ 'role_has_permissions', 'resource' ],
        order: {
          isSubRoute: 'ASC',
          name: 'ASC'
        }
      });
    } catch (error) {
      console.error('Error finding permissions by resource:', error);
      throw error;
    }
  }

  // Nuevo método para obtener permisos por routeCode del recurso
  async findByResourceRouteCode(routeCode: string) {
    try {
      return await this.permissionRepository
        .createQueryBuilder('permission')
        .leftJoinAndSelect('permission.resource', 'resource')
        .leftJoinAndSelect('permission.role_has_permissions', 'role_has_permissions')
        .where('resource.routeCode = :routeCode', { routeCode })
        .orderBy('permission.isSubRoute', 'ASC')
        .addOrderBy('permission.name', 'ASC')
        .getMany();
    } catch (error) {
      console.error('Error finding permissions by resource routeCode:', error);
      throw error;
    }
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      await this.permissionRepository.update(id, updatePermissionDto);
      return await this.findOne(id);
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.permissionRepository.delete(id);
    } catch (error) {
      console.error('Error removing permission:', error);
      throw error;
    }
  }

  // Nuevo método para actualizar módulos masivamente
  async updateModule(oldRouteCode: string, newRouteCode: string, newDisplayName: string, newActions?: string[]) {
    try {
      // Buscar todos los permisos con el routeCode anterior
      const permissionsToUpdate = await this.permissionRepository.find({
        where: { routeCode: oldRouteCode }
      });

      if (permissionsToUpdate.length === 0) {
        throw new Error(`No se encontraron permisos con routeCode: ${oldRouteCode}`);
      }

      // Actualizar todos los permisos del módulo
      for (const permission of permissionsToUpdate) {
        const updateData: any = {
          routeCode: newRouteCode,
          displayName: newDisplayName
        };

        // Si se proporcionan nuevas acciones, actualizar SOLO el permiso base
        // y NO acumular acciones existentes
        if (newActions && !permission.isSubRoute) {
          // Reemplazar completamente las acciones, no acumular
          updateData.actions = newActions;
        }

        await this.permissionRepository.update(permission.id, updateData);
      }

      // Retornar el primer permiso actualizado como referencia
      return await this.findOne(permissionsToUpdate[ 0 ].id);
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  async getSummary() {
    try {
      const permissions = await this.findAll();

      const summary = {
        total: permissions.length,
        active: permissions.filter(permission => permission.role_has_permissions && permission.role_has_permissions.length > 0).length,
        inactive: permissions.filter(permission => !permission.role_has_permissions || permission.role_has_permissions.length === 0).length,
        subRoutes: permissions.filter(permission => permission.isSubRoute).length,
        mainRoutes: permissions.filter(permission => !permission.isSubRoute).length,
        permissionsWithActions: permissions.filter(permission => permission.actions && permission.actions.length > 0).length,
        permissionsWithoutActions: permissions.filter(permission => !permission.actions || permission.actions.length === 0).length,
      };

      return summary;
    } catch (error) {
      console.error('Error in getSummary:', error);
      throw error;
    }
  }
}