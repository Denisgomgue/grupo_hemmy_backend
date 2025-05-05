import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../role/entities/role.entity';
import { User } from '../../user/entities/user.entity';
import { DatabaseSeederService } from './database-seeders.service';
import { CommandModule } from 'nestjs-command';
import { DatabaseSeederCommand } from './database-seeder.command';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role]),
        CommandModule,
    ],
    providers: [DatabaseSeederService, DatabaseSeederCommand],
    exports: [DatabaseSeederService],
})
export class DatabaseSeederModule { }