const mysql = require('mysql2/promise');
require('dotenv').config();

const resources = [
  {
    routeCode: 'dashboard',
    displayName: 'Dashboard',
    description: 'Panel principal del sistema',
    isActive: true,
    orderIndex: 1,
  },
  {
    routeCode: 'clients',
    displayName: 'Clientes',
    description: 'Gestión de clientes',
    isActive: true,
    orderIndex: 2,
  },
  {
    routeCode: 'payments',
    displayName: 'Pagos',
    description: 'Gestión de pagos',
    isActive: true,
    orderIndex: 3,
  },
  {
    routeCode: 'installations',
    displayName: 'Instalaciones',
    description: 'Gestión de instalaciones',
    isActive: true,
    orderIndex: 4,
  },
  {
    routeCode: 'devices',
    displayName: 'Dispositivos',
    description: 'Gestión de dispositivos',
    isActive: true,
    orderIndex: 5,
  },
  {
    routeCode: 'employees',
    displayName: 'Empleados',
    description: 'Gestión de empleados',
    isActive: true,
    orderIndex: 6,
  },
  {
    routeCode: 'reports',
    displayName: 'Reportes',
    description: 'Generación de reportes',
    isActive: true,
    orderIndex: 7,
  },
  {
    routeCode: 'users',
    displayName: 'Usuarios',
    description: 'Gestión de usuarios del sistema',
    isActive: true,
    orderIndex: 8,
  },
  {
    routeCode: 'roles',
    displayName: 'Roles',
    description: 'Gestión de roles y permisos',
    isActive: true,
    orderIndex: 9,
  },
  {
    routeCode: 'permissions',
    displayName: 'Permisos',
    description: 'Gestión granular de permisos',
    isActive: true,
    orderIndex: 10,
  },
  {
    routeCode: 'company',
    displayName: 'Empresa',
    description: 'Configuración de la empresa',
    isActive: true,
    orderIndex: 11,
  },
  {
    routeCode: 'services',
    displayName: 'Servicios',
    description: 'Gestión de servicios',
    isActive: true,
    orderIndex: 12,
  },
  {
    routeCode: 'plans',
    displayName: 'Planes',
    description: 'Gestión de planes',
    isActive: true,
    orderIndex: 13,
  },
  {
    routeCode: 'sectors',
    displayName: 'Sectores',
    description: 'Gestión de sectores',
    isActive: true,
    orderIndex: 14,
  },
];

async function checkAndCreateResources() {
  let connection;

  try {
    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'group_hemmy',
    });

    console.log('🔍 Verificando recursos existentes...');

    // Verificar si la tabla resources existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'resources'");

    if (tables.length === 0) {
      console.log(
        '❌ La tabla "resources" no existe. Ejecuta las migraciones primero.',
      );
      return;
    }

    // Contar recursos existentes
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM resources',
    );
    const existingCount = countResult[0].count;

    console.log(`📊 Recursos existentes: ${existingCount}`);

    if (existingCount > 0) {
      console.log('✅ Ya existen recursos en la base de datos.');

      // Mostrar recursos existentes
      const [existingResources] = await connection.execute(
        'SELECT routeCode, displayName FROM resources ORDER BY orderIndex',
      );

      console.log('📋 Recursos disponibles:');
      existingResources.forEach((resource) => {
        console.log(`   - ${resource.displayName} (${resource.routeCode})`);
      });

      return;
    }

    console.log('🌱 Creando recursos...');

    // Insertar recursos
    for (const resource of resources) {
      await connection.execute(
        `INSERT INTO resources (routeCode, displayName, description, isActive, orderIndex, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          resource.routeCode,
          resource.displayName,
          resource.description,
          resource.isActive,
          resource.orderIndex,
        ],
      );
      console.log(`✅ Creado: ${resource.displayName}`);
    }

    console.log('🎉 ¡Recursos creados exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar el script
checkAndCreateResources();
