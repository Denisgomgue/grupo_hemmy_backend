import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../role/entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { DatabaseSeederService } from './database-seeders.service';
import { CommandModule } from 'nestjs-command';
import { DatabaseSeederCommand } from './database-seeder.command';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleHasPermission } from '../../role-has-permissions/entities/role-has-permission.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { Company } from '../../company/entities/company.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ User, Role, Permission, RoleHasPermission, Resource, Company ]),
        CommandModule,
    ],
    providers: [ DatabaseSeederService, DatabaseSeederCommand ],
    exports: [ DatabaseSeederService ],
})
export class DatabaseSeederModule { }