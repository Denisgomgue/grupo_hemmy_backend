-- =====================================================
-- PASO 10: LIMPIAR TABLAS ANTIGUAS (OPCIONAL)
-- =====================================================

-- Configuración inicial
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Verificación previa
SELECT 
    'VERIFICACIÓN PREVIA A LIMPIEZA' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM clients) = (SELECT COUNT(*) FROM client) THEN 'OK'
        ELSE 'ERROR - Revisar migración de clientes'
    END as clients_check,
    CASE 
        WHEN (SELECT COUNT(*) FROM payments) = (SELECT COUNT(*) FROM payment) THEN 'OK'
        ELSE 'ERROR - Revisar migración de pagos'
    END as payments_check,
    CASE 
        WHEN (SELECT COUNT(*) FROM payment_histories) = (SELECT COUNT(*) FROM payment_history) THEN 'OK'
        ELSE 'ERROR - Revisar migración de historial'
    END as payment_histories_check;

-- Eliminamos tablas directamente
DROP TABLE IF EXISTS `payment_history`;
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `client`;

-- Verificación post-limpieza
SELECT 
    'VERIFICACIÓN POST-LIMPIEZA' as section,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'client') THEN 'ELIMINADA'
        ELSE 'EXISTE'
    END as client_table,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment') THEN 'ELIMINADA'
        ELSE 'EXISTE'
    END as payment_table,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment_history') THEN 'ELIMINADA'
        ELSE 'EXISTE'
    END as payment_history_table;

-- Habilitar verificaciones
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Registrar limpieza completada
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'CleanupOldTables', 'COMPLETED');

COMMIT;

SELECT 'Limpieza de tablas antiguas completada exitosamente' as message;
