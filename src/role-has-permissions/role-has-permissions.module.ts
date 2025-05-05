import { Module } from '@nestjs/common';
import { RoleHasPermissionsService } from './role-has-permissions.service';
import { RoleHasPermissionsController } from './role-has-permissions.controller';

@Module({
  controllers: [RoleHasPermissionsController],
  providers: [RoleHasPermissionsService],
})
export class RoleHasPermissionsModule {}
