import { DataSource } from 'typeorm';
import { Resource } from '../../resources/entities/resource.entity';

export class ResourceSeeder {
    constructor(private dataSource: DataSource) { }

    async run(): Promise<void> {
        const resourceRepository = this.dataSource.getRepository(Resource);

        // Verificar si ya existen recursos
        const existingResources = await resourceRepository.count();
        if (existingResources > 0) {
            // Log removido para limpieza
            return;
        }

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

        for (const resourceData of resources) {
            const resource = resourceRepository.create(resourceData);
            await resourceRepository.save(resource);
        }

        // Log removido para limpieza
    }
} 