import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleHasPermission } from '../../role-has-permissions/entities/role-has-permission.entity';
import { User } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeederService {
    private readonly logger = new Logger(DatabaseSeederService.name);

    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
        @InjectRepository(RoleHasPermission)
        private roleHasPermissionRepository: Repository<RoleHasPermission>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async seed() {
        const adminRole = await this.seedAdminRole();
        await this.seedAdminUser(adminRole);
    }

    private async seedAdminRole(): Promise<Role> {
        const existingRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
        if (existingRole) {
            this.logger.log('Role "admin" ya existe.');
            return existingRole;
        }

        const adminRole = this.roleRepository.create({
            name: 'admin',
            description: 'Administrador del sistema'
        });

        await this.roleRepository.save(adminRole);
        this.logger.log('Role "admin" creado exitosamente.');
        return adminRole;
    }

    private async seedAdminUser(adminRole: Role): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: { email: 'admin@hemmy.com' } });
        if (existingUser) {
            this.logger.log('Usuario con email "admin@hemmy.com" ya existe.');
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = this.userRepository.create({
            name: 'Admin',
            surname: 'Hemmy',
            username: 'hemicha',
            email: 'admin@hemmy.com',
            password: hashedPassword,
            role: adminRole,
            isActive: true,
            documentType: "DNI",
            documentNumber: "12345678",
            phone: "999999999"
        });

        await this.userRepository.save(adminUser);
        this.logger.log('Usuario admin creado exitosamente.');
    }
}