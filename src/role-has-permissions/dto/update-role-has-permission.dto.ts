import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleHasPermissionDto } from './create-role-has-permission.dto';

export class UpdateRoleHasPermissionDto extends PartialType(CreateRoleHasPermissionDto) {}
