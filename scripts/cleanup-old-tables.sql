-- =====================================================
-- SCRIPT DE LIMPIEZA DE TABLAS ANTIGUAS
-- Ejecutar SOLO después de verificar que la migración fue exitosa
-- =====================================================

-- Configuración inicial
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- =====================================================
-- VERIFICACIÓN DE MIGRACIÓN EXITOSA
-- =====================================================

-- Verificar que las tablas nuevas existen y tienen datos
SELECT 
    'clients' as table_name,
    COUNT(*) as record_count
FROM clients
UNION ALL
SELECT 
    'installations' as table_name,
    COUNT(*) as record_count
FROM installations
UNION ALL
SELECT 
    'client_payment_configs' as table_name,
    COUNT(*) as record_count
FROM client_payment_configs
UNION ALL
SELECT 
    'payments' as table_name,
    COUNT(*) as record_count
FROM payments
UNION ALL
SELECT 
    'payment_histories' as table_name,
    COUNT(*) as record_count
FROM payment_histories
UNION ALL
SELECT 
    'devices' as table_name,
    COUNT(*) as record_count
FROM devices;

-- Verificar que no hay registros huérfanos
SELECT 
    'Orphaned payments' as check_type,
    COUNT(*) as count
FROM payments p
LEFT JOIN clients c ON p.clientId = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Orphaned installations' as check_type,
    COUNT(*) as count
FROM installations i
LEFT JOIN clients c ON i.clientId = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Orphaned payment_histories' as check_type,
    COUNT(*) as count
FROM payment_histories ph
LEFT JOIN payments p ON ph.paymentId = p.id
WHERE p.id IS NULL;

-- =====================================================
-- ELIMINACIÓN DE TABLAS ANTIGUAS
-- =====================================================

-- Eliminar restricciones de clave foránea de tablas antiguas
ALTER TABLE payment_history DROP FOREIGN KEY IF EXISTS FK_a3219994ab452282c74ef6de2ca;
ALTER TABLE payment_history DROP FOREIGN KEY IF EXISTS FK_ab67a904aa1c9a7d606feadfa94;
ALTER TABLE payment_history DROP FOREIGN KEY IF EXISTS FK_34d643de1a588d2350297da5c24;

ALTER TABLE payment DROP FOREIGN KEY IF EXISTS FK_bbbabef6ffa9572acb68cb0f217;

ALTER TABLE client DROP FOREIGN KEY IF EXISTS FK_bcf9ab88c1c1ec520623e7856c1;
ALTER TABLE client DROP FOREIGN KEY IF EXISTS FK_9ddf6e81411dd6a67013009281a;

-- Eliminar tablas antiguas
DROP TABLE IF EXISTS `payment_history`;
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `client`;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas antiguas ya no existen
SELECT 
    TABLE_NAME,
    'EXISTS' as status
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('client', 'payment', 'payment_history')
UNION ALL
SELECT 
    'client' as TABLE_NAME,
    'DROPPED' as status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'client'
)
UNION ALL
SELECT 
    'payment' as TABLE_NAME,
    'DROPPED' as status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment'
)
UNION ALL
SELECT 
    'payment_history' as TABLE_NAME,
    'DROPPED' as status
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_history'
);

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
COMMIT;

-- Registrar limpieza como completada
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'CleanupOldTables', 'COMPLETED');

SELECT 'Limpieza de tablas antiguas completada exitosamente' as message; 