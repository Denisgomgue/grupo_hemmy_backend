-- Script para verificar y crear recursos en la base de datos
-- Ejecutar este script en tu base de datos MySQL

-- Verificar si existen recursos
SELECT COUNT(*) as total_resources FROM resources;

-- Mostrar recursos existentes
SELECT routeCode, displayName, description, isActive, orderIndex 
FROM resources 
ORDER BY orderIndex;

-- Si no hay recursos, ejecutar las siguientes inserciones:

INSERT INTO resources (routeCode, displayName, description, isActive, orderIndex, created_at, updated_at) VALUES
('dashboard', 'Dashboard', 'Panel principal del sistema', true, 1, NOW(), NOW()),
('clients', 'Clientes', 'Gestión de clientes', true, 2, NOW(), NOW()),
('payments', 'Pagos', 'Gestión de pagos', true, 3, NOW(), NOW()),
('installations', 'Instalaciones', 'Gestión de instalaciones', true, 4, NOW(), NOW()),
('devices', 'Dispositivos', 'Gestión de dispositivos', true, 5, NOW(), NOW()),
('employees', 'Empleados', 'Gestión de empleados', true, 6, NOW(), NOW()),
('reports', 'Reportes', 'Generación de reportes', true, 7, NOW(), NOW()),
('users', 'Usuarios', 'Gestión de usuarios del sistema', true, 8, NOW(), NOW()),
('roles', 'Roles', 'Gestión de roles y permisos', true, 9, NOW(), NOW()),
('permissions', 'Permisos', 'Gestión granular de permisos', true, 10, NOW(), NOW()),
('company', 'Empresa', 'Configuración de la empresa', true, 11, NOW(), NOW()),
('services', 'Servicios', 'Gestión de servicios', true, 12, NOW(), NOW()),
('plans', 'Planes', 'Gestión de planes', true, 13, NOW(), NOW()),
('sectors', 'Sectores', 'Gestión de sectores', true, 14, NOW(), NOW());

-- Verificar que se crearon correctamente
SELECT routeCode, displayName, description, isActive, orderIndex 
FROM resources 
ORDER BY orderIndex; 