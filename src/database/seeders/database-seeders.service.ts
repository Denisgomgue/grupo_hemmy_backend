import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { User } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeederService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async seed() {
        const adminRole = await this.seedAdminRole();
        await this.seedAdminUser(adminRole);
    }

    private async seedAdminRole(): Promise<Role> {
        const existingRole = await this.roleRepository.findOne({ where: { name: 'Admin' } });
        if (existingRole) {
            return existingRole;
        }

        const adminRole = this.roleRepository.create({
            name: 'Admin',
            description: 'Administrator role with full access',
            allowAll: true,
            isPublic: false,
        });

        return this.roleRepository.save(adminRole);
    }

    private async seedAdminUser(adminRole: Role): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: { email: 'admin@hemmy.com' } });
        if (existingUser) {
            console.log(`User with email 'admin@hemmy.com' already exists.`);
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = this.userRepository.create({
            name: 'Admin',
            surname: 'Hemmy',
            username: 'LuaxitoFiuFiu',
            email: 'admin@hemmy.com',
            password: hashedPassword,
            role: adminRole,
            isActive: true,
            documentType: "DNI",
            documentNumber: "12345678",
            phone: "999999999"
        });

        await this.userRepository.save(adminUser);
        console.log(`Admin user created successfully.`);
    }
}