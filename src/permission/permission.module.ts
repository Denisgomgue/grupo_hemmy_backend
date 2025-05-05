import { Module } from '@nestjs/common';
import { PermissionsService } from './permission.service';
import { PermissionsController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService, TypeOrmModule],
})
export class PermissionModule {}
