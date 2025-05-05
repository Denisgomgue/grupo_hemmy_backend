import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { RoleHasPermission } from 'src/role-has-permissions/entities/role-has-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RoleHasPermission])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService, TypeOrmModule],
})
export class RoleModule { }
