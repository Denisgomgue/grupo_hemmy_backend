import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleHasPermissionsService } from './role-has-permissions.service';
import { RoleHasPermissionsController } from './role-has-permissions.controller';
import { RoleHasPermission } from './entities/role-has-permission.entity';
import { Role } from '../role/entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ RoleHasPermission, Role, Permission ]),
  ],
  controllers: [ RoleHasPermissionsController ],
  providers: [ RoleHasPermissionsService ],
  exports: [ RoleHasPermissionsService ],
})
export class RoleHasPermissionsModule { }
