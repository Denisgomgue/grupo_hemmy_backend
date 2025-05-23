import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../role/entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { DatabaseSeederService } from './database-seeders.service';
import { CommandModule } from 'nestjs-command';
import { DatabaseSeederCommand } from './database-seeder.command';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleHasPermission } from '../../role-has-permissions/entities/role-has-permission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ User, Role, Permission, RoleHasPermission ]),
        CommandModule,
    ],
    providers: [ DatabaseSeederService, DatabaseSeederCommand ],
    exports: [ DatabaseSeederService ],
})
export class DatabaseSeederModule { }