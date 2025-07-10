-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE MIGRACIÓN
-- Verificar que la migración fue exitosa y los datos están correctos
-- =====================================================

-- =====================================================
-- VERIFICACIÓN DE ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar que las tablas nuevas existen
SELECT 
    'NUEVAS TABLAS' as section,
    TABLE_NAME,
    'EXISTS' as status
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('clients', 'installations', 'client_payment_configs', 'payments', 'payment_histories', 'devices', 'employees')
ORDER BY TABLE_NAME;

-- Verificar que las tablas antiguas aún existen (antes de limpiar)
SELECT 
    'TABLAS ANTIGUAS' as section,
    TABLE_NAME,
    'EXISTS' as status
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('client', 'payment', 'payment_history')
ORDER BY TABLE_NAME;

-- =====================================================
-- VERIFICACIÓN DE CONTEO DE REGISTROS
-- =====================================================

-- Contar registros en tablas nuevas
SELECT 
    'CONTEO DE REGISTROS - TABLAS NUEVAS' as section,
    'clients' as table_name,
    COUNT(*) as record_count
FROM clients
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS NUEVAS' as section,
    'installations' as table_name,
    COUNT(*) as record_count
FROM installations
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS NUEVAS' as section,
    'client_payment_configs' as table_name,
    COUNT(*) as record_count
FROM client_payment_configs
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS NUEVAS' as section,
    'payments' as table_name,
    COUNT(*) as record_count
FROM payments
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS NUEVAS' as section,
    'payment_histories' as table_name,
    COUNT(*) as record_count
FROM payment_histories
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS NUEVAS' as section,
    'devices' as table_name,
    COUNT(*) as record_count
FROM devices
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS NUEVAS' as section,
    'employees' as table_name,
    COUNT(*) as record_count
FROM employees;

-- Contar registros en tablas antiguas
SELECT 
    'CONTEO DE REGISTROS - TABLAS ANTIGUAS' as section,
    'client' as table_name,
    COUNT(*) as record_count
FROM client
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS ANTIGUAS' as section,
    'payment' as table_name,
    COUNT(*) as record_count
FROM payment
UNION ALL
SELECT 
    'CONTEO DE REGISTROS - TABLAS ANTIGUAS' as section,
    'payment_history' as table_name,
    COUNT(*) as record_count
FROM payment_history;

-- =====================================================
-- VERIFICACIÓN DE INTEGRIDAD DE DATOS
-- =====================================================

-- Verificar que no hay registros huérfanos
SELECT 
    'VERIFICACIÓN DE INTEGRIDAD' as section,
    'Orphaned payments' as check_type,
    COUNT(*) as count
FROM payments p
LEFT JOIN clients c ON p.clientId = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'VERIFICACIÓN DE INTEGRIDAD' as section,
    'Orphaned installations' as check_type,
    COUNT(*) as count
FROM installations i
LEFT JOIN clients c ON i.clientId = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'VERIFICACIÓN DE INTEGRIDAD' as section,
    'Orphaned payment_histories' as check_type,
    COUNT(*) as count
FROM payment_histories ph
LEFT JOIN payments p ON ph.paymentId = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
    'VERIFICACIÓN DE INTEGRIDAD' as section,
    'Orphaned client_payment_configs' as check_type,
    COUNT(*) as count
FROM client_payment_configs cpc
LEFT JOIN installations i ON cpc.installationId = i.id
WHERE i.id IS NULL
UNION ALL
SELECT 
    'VERIFICACIÓN DE INTEGRIDAD' as section,
    'Orphaned devices' as check_type,
    COUNT(*) as count
FROM devices d
LEFT JOIN clients c ON d.assignedClientId = c.id
WHERE d.assignedClientId IS NOT NULL AND c.id IS NULL;

-- =====================================================
-- VERIFICACIÓN DE MIGRACIÓN DE CLIENTES
-- =====================================================

-- Comparar clientes migrados
SELECT 
    'MIGRACIÓN DE CLIENTES' as section,
    'Clients migrated' as check_type,
    COUNT(*) as count
FROM clients
UNION ALL
SELECT 
    'MIGRACIÓN DE CLIENTES' as section,
    'Original clients' as check_type,
    COUNT(*) as count
FROM client;

-- Verificar que todos los DNIs únicos se migraron correctamente
SELECT 
    'VERIFICACIÓN DE DNIs' as section,
    'Unique DNIs in new clients' as check_type,
    COUNT(DISTINCT dni) as count
FROM clients
UNION ALL
SELECT 
    'VERIFICACIÓN DE DNIs' as section,
    'Unique DNIs in old client' as check_type,
    COUNT(DISTINCT dni) as count
FROM client;

-- =====================================================
-- VERIFICACIÓN DE MIGRACIÓN DE PAGOS
-- =====================================================

-- Comparar pagos migrados
SELECT 
    'MIGRACIÓN DE PAGOS' as section,
    'Payments migrated' as check_type,
    COUNT(*) as count
FROM payments
UNION ALL
SELECT 
    'MIGRACIÓN DE PAGOS' as section,
    'Original payments' as check_type,
    COUNT(*) as count
FROM payment;

-- Verificar que los montos coinciden
SELECT 
    'VERIFICACIÓN DE MONTOS' as section,
    'Total amount in new payments' as check_type,
    SUM(amount) as total_amount
FROM payments
UNION ALL
SELECT 
    'VERIFICACIÓN DE MONTOS' as section,
    'Total amount in old payment' as check_type,
    SUM(amount) as total_amount
FROM payment;

-- =====================================================
-- VERIFICACIÓN DE DISPOSITIVOS
-- =====================================================

-- Verificar dispositivos migrados
SELECT 
    'MIGRACIÓN DE DISPOSITIVOS' as section,
    'Total devices migrated' as check_type,
    COUNT(*) as count
FROM devices
UNION ALL
SELECT 
    'MIGRACIÓN DE DISPOSITIVOS' as section,
    'Router devices' as check_type,
    COUNT(*) as count
FROM devices
WHERE type = 'router'
UNION ALL
SELECT 
    'MIGRACIÓN DE DISPOSITIVOS' as section,
    'Deco devices' as check_type,
    COUNT(*) as count
FROM devices
WHERE type = 'deco';

-- Verificar dispositivos desde tabla original
SELECT 
    'DISPOSITIVOS ORIGINALES' as section,
    'Clients with router serial' as check_type,
    COUNT(*) as count
FROM client
WHERE routerSerial IS NOT NULL AND routerSerial <> ''
UNION ALL
SELECT 
    'DISPOSITIVOS ORIGINALES' as section,
    'Clients with deco serial' as check_type,
    COUNT(*) as count
FROM client
WHERE decoSerial IS NOT NULL AND decoSerial <> '';

-- =====================================================
-- VERIFICACIÓN DE RELACIONES
-- =====================================================

-- Verificar relaciones de instalaciones
SELECT 
    'VERIFICACIÓN DE RELACIONES' as section,
    'Installations with valid client' as check_type,
    COUNT(*) as count
FROM installations i
INNER JOIN clients c ON i.clientId = c.id
UNION ALL
SELECT 
    'VERIFICACIÓN DE RELACIONES' as section,
    'Installations with valid plan' as check_type,
    COUNT(*) as count
FROM installations i
INNER JOIN plans p ON i.planId = p.id
UNION ALL
SELECT 
    'VERIFICACIÓN DE RELACIONES' as section,
    'Installations with valid sector' as check_type,
    COUNT(*) as count
FROM installations i
INNER JOIN sectors s ON i.sectorId = s.id;

-- =====================================================
-- RESUMEN DE VERIFICACIÓN
-- =====================================================

SELECT 
    'RESUMEN' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM clients) = (SELECT COUNT(*) FROM client) THEN 'OK'
        ELSE 'ERROR'
    END as clients_migration,
    CASE 
        WHEN (SELECT COUNT(*) FROM payments) = (SELECT COUNT(*) FROM payment) THEN 'OK'
        ELSE 'ERROR'
    END as payments_migration,
    CASE 
        WHEN (SELECT COUNT(*) FROM payment_histories) = (SELECT COUNT(*) FROM payment_history) THEN 'OK'
        ELSE 'ERROR'
    END as payment_histories_migration,
    CASE 
        WHEN (SELECT COUNT(*) FROM installations) = (SELECT COUNT(*) FROM client) THEN 'OK'
        ELSE 'ERROR'
    END as installations_migration;

-- =====================================================
-- RECOMENDACIONES
-- =====================================================

SELECT 
    'RECOMENDACIONES' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM clients) = (SELECT COUNT(*) FROM client) 
             AND (SELECT COUNT(*) FROM payments) = (SELECT COUNT(*) FROM payment)
             AND (SELECT COUNT(*) FROM payment_histories) = (SELECT COUNT(*) FROM payment_history)
        THEN 'MIGRACIÓN EXITOSA - Puede proceder con la limpieza de tablas antiguas'
        ELSE 'REVISAR MIGRACIÓN - Hay inconsistencias en los datos'
    END as recommendation; 