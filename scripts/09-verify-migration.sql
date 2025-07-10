-- =====================================================
-- PASO 9: VERIFICAR MIGRACIÓN
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
FROM devices;

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
WHERE c.id IS NULL;

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

-- RESUMEN DE VERIFICACIÓN
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

-- RECOMENDACIONES
SELECT 
    'RECOMENDACIONES' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM clients) = (SELECT COUNT(*) FROM client) 
             AND (SELECT COUNT(*) FROM payments) = (SELECT COUNT(*) FROM payment)
             AND (SELECT COUNT(*) FROM payment_histories) = (SELECT COUNT(*) FROM payment_history)
        THEN 'MIGRACIÓN EXITOSA - Puede proceder con la limpieza de tablas antiguas'
        ELSE 'REVISAR MIGRACIÓN - Hay inconsistencias en los datos'
    END as recommendation;

-- Registrar verificación completada
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'VerifyMigration', 'COMPLETED');

COMMIT; 