import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleHasPermission } from '../../role-has-permissions/entities/role-has-permission.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
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
        @InjectRepository(Resource)
        private resourceRepository: Repository<Resource>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
    ) { }

    async seed() {
        const adminRole = await this.seedAdminRole();
        await this.seedAdminUser(adminRole);
        await this.seedCompany();
        await this.seedResources();
        await this.seedPermissions();
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
            username: 'hemi',
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

    private async seedCompany(): Promise<void> {
        const existingCompany = await this.companyRepository.findOne({ where: { ruc: '20610631143' } });
        if (existingCompany) {
            this.logger.log('Empresa con RUC "20610631143" ya existe.');
            return;
        }

        const company = this.companyRepository.create({
            name: 'Grupo Hemmy',
            businessName: 'Grupo Hemmy',
            ruc: '20610631143',
            address: 'AV. CORDILLERA BLANCA NRO. 325 BAR. MONTERREY',
            district: 'Huaraz',
            city: 'Huaraz',
            province: 'Independencia',
            country: 'Perú',
            phone: '+51945447970',
            email: '-',
            website: '',
            isActive: true
        });

        await this.companyRepository.save(company);
        this.logger.log('Empresa Grupo Hemmy creada exitosamente.');
    }

    private async seedResources(): Promise<void> {
        this.logger.log('🌱 Iniciando inserción de recursos (módulos)...');

        const resources = [
            {
                routeCode: 'dashboard',
                displayName: 'Dashboard',
                description: 'Panel principal del sistema',
                isActive: true,
                orderIndex: 1
            },
            {
                routeCode: 'clients',
                displayName: 'Clientes',
                description: 'Gestión de clientes',
                isActive: true,
                orderIndex: 2
            },
            {
                routeCode: 'payments',
                displayName: 'Pagos',
                description: 'Gestión de pagos',
                isActive: true,
                orderIndex: 3
            },
            {
                routeCode: 'installations',
                displayName: 'Instalaciones',
                description: 'Gestión de instalaciones',
                isActive: true,
                orderIndex: 4
            },
            {
                routeCode: 'devices',
                displayName: 'Dispositivos',
                description: 'Gestión de dispositivos',
                isActive: true,
                orderIndex: 5
            },
            {
                routeCode: 'employees',
                displayName: 'Empleados',
                description: 'Gestión de empleados',
                isActive: true,
                orderIndex: 6
            },
            {
                routeCode: 'reports',
                displayName: 'Reportes',
                description: 'Generación de reportes',
                isActive: true,
                orderIndex: 7
            },
            {
                routeCode: 'users',
                displayName: 'Usuarios',
                description: 'Gestión de usuarios del sistema',
                isActive: true,
                orderIndex: 8
            },
            {
                routeCode: 'roles',
                displayName: 'Roles',
                description: 'Gestión de roles y permisos',
                isActive: true,
                orderIndex: 9
            },
            {
                routeCode: 'permissions',
                displayName: 'Permisos',
                description: 'Gestión granular de permisos',
                isActive: true,
                orderIndex: 10
            },
            {
                routeCode: 'company',
                displayName: 'Empresa',
                description: 'Configuración de la empresa',
                isActive: true,
                orderIndex: 11
            },
            {
                routeCode: 'services',
                displayName: 'Servicios',
                description: 'Gestión de servicios',
                isActive: true,
                orderIndex: 12
            },
            {
                routeCode: 'plans',
                displayName: 'Planes',
                description: 'Gestión de planes',
                isActive: true,
                orderIndex: 13
            },
            {
                routeCode: 'sectors',
                displayName: 'Sectores',
                description: 'Gestión de sectores',
                isActive: true,
                orderIndex: 14
            }
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const resourceData of resources) {
            const existingResource = await this.resourceRepository.findOne({
                where: { routeCode: resourceData.routeCode }
            });

            if (existingResource) {
                this.logger.log(`⏭️  Recurso "${resourceData.displayName}" ya existe, saltando...`);
                skippedCount++;
                continue;
            }

            const resource = this.resourceRepository.create(resourceData);
            await this.resourceRepository.save(resource);
            this.logger.log(`✅ Recurso "${resourceData.displayName}" creado`);
            createdCount++;
        }

        this.logger.log(`🎉 ¡Inserción de recursos completada!`);
        this.logger.log(`📊 Resumen:`);
        this.logger.log(`   ✅ Recursos creados: ${createdCount}`);
        this.logger.log(`   ⏭️  Recursos existentes (saltados): ${skippedCount}`);
    }

    private async seedPermissions(): Promise<void> {
        this.logger.log('🌱 Iniciando inserción de permisos base...');

        // Definir los módulos y sus permisos base (solo CRUD)
        const MODULES_CONFIG = [
            {
                routeCode: 'payments',
                name: 'Pagos',
                basePermissions: [
                    { name: 'Crear Pago', actions: [ 'create' ] },
                    { name: 'Ver Pagos', actions: [ 'read' ] },
                    { name: 'Modificar Pago', actions: [ 'update' ] },
                    { name: 'Eliminar Pago', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'clients',
                name: 'Clientes',
                basePermissions: [
                    { name: 'Crear Cliente', actions: [ 'create' ] },
                    { name: 'Ver Clientes', actions: [ 'read' ] },
                    { name: 'Modificar Cliente', actions: [ 'update' ] },
                    { name: 'Eliminar Cliente', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'installations',
                name: 'Instalaciones',
                basePermissions: [
                    { name: 'Crear Instalación', actions: [ 'create' ] },
                    { name: 'Ver Instalaciones', actions: [ 'read' ] },
                    { name: 'Modificar Instalación', actions: [ 'update' ] },
                    { name: 'Eliminar Instalación', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'employees',
                name: 'Empleados',
                basePermissions: [
                    { name: 'Crear Empleado', actions: [ 'create' ] },
                    { name: 'Ver Empleados', actions: [ 'read' ] },
                    { name: 'Modificar Empleado', actions: [ 'update' ] },
                    { name: 'Eliminar Empleado', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'devices',
                name: 'Dispositivos',
                basePermissions: [
                    { name: 'Crear Dispositivo', actions: [ 'create' ] },
                    { name: 'Ver Dispositivos', actions: [ 'read' ] },
                    { name: 'Modificar Dispositivo', actions: [ 'update' ] },
                    { name: 'Eliminar Dispositivo', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'plans',
                name: 'Planes',
                basePermissions: [
                    { name: 'Crear Plan', actions: [ 'create' ] },
                    { name: 'Ver Planes', actions: [ 'read' ] },
                    { name: 'Modificar Plan', actions: [ 'update' ] },
                    { name: 'Eliminar Plan', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'services',
                name: 'Servicios',
                basePermissions: [
                    { name: 'Crear Servicio', actions: [ 'create' ] },
                    { name: 'Ver Servicios', actions: [ 'read' ] },
                    { name: 'Modificar Servicio', actions: [ 'update' ] },
                    { name: 'Eliminar Servicio', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'reports',
                name: 'Reportes',
                basePermissions: [
                    { name: 'Ver Reportes', actions: [ 'read' ] },
                ]
            },
            {
                routeCode: 'company',
                name: 'Empresa',
                basePermissions: [
                    { name: 'Ver Empresa', actions: [ 'read' ] },
                    { name: 'Modificar Empresa', actions: [ 'update' ] },
                ]
            },
            {
                routeCode: 'users',
                name: 'Usuarios',
                basePermissions: [
                    { name: 'Crear Usuario', actions: [ 'create' ] },
                    { name: 'Ver Usuarios', actions: [ 'read' ] },
                    { name: 'Modificar Usuario', actions: [ 'update' ] },
                    { name: 'Eliminar Usuario', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'roles',
                name: 'Roles',
                basePermissions: [
                    { name: 'Crear Rol', actions: [ 'create' ] },
                    { name: 'Ver Roles', actions: [ 'read' ] },
                    { name: 'Modificar Rol', actions: [ 'update' ] },
                    { name: 'Eliminar Rol', actions: [ 'delete' ] },
                ]
            },
            {
                routeCode: 'permissions',
                name: 'Permisos',
                basePermissions: [
                    { name: 'Ver Permisos', actions: [ 'read' ] },
                ]
            }
        ];

        let createdCount = 0;
        let skippedCount = 0;

        for (const moduleConfig of MODULES_CONFIG) {
            this.logger.log(`📁 Procesando módulo: ${moduleConfig.name} (${moduleConfig.routeCode})`);

            // Buscar el recurso correspondiente
            const resource = await this.resourceRepository.findOne({
                where: { routeCode: moduleConfig.routeCode }
            });

            if (!resource) {
                this.logger.log(`  ⚠️  Recurso "${moduleConfig.routeCode}" no encontrado, saltando módulo...`);
                continue;
            }

            // Procesar solo permisos base (CRUD)
            for (const basePermission of moduleConfig.basePermissions) {
                const existingPermission = await this.permissionRepository.findOne({
                    where: {
                        name: basePermission.name,
                        routeCode: moduleConfig.routeCode
                    }
                });

                if (existingPermission) {
                    this.logger.log(`  ⏭️  Permiso base "${basePermission.name}" ya existe, saltando...`);
                    skippedCount++;
                    continue;
                }

                const newPermission = this.permissionRepository.create({
                    name: basePermission.name,
                    displayName: moduleConfig.name,
                    routeCode: moduleConfig.routeCode,
                    actions: basePermission.actions,
                    restrictions: [],
                    isSubRoute: false,
                    resourceId: resource.id  // ← Vincular con el recurso
                });

                await this.permissionRepository.save(newPermission);
                this.logger.log(`  ✅ Permiso base "${basePermission.name}" creado (vinculado a recurso ID: ${resource.id})`);
                createdCount++;
            }
        }

        this.logger.log(`🎉 ¡Inserción de permisos base completada!`);
        this.logger.log(`📊 Resumen:`);
        this.logger.log(`   ✅ Permisos creados: ${createdCount}`);
        this.logger.log(`   ⏭️  Permisos existentes (saltados): ${skippedCount}`);
        this.logger.log(`   📁 Módulos procesados: ${MODULES_CONFIG.length}`);
        this.logger.log(`   🔗 Nota: Todos los permisos están vinculados a sus recursos correspondientes.`);
    }
}