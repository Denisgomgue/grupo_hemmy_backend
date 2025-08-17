-- =====================================================
-- SCRIPT DE DIAGNÓSTICO: Verificar estructura de tablas
-- =====================================================

-- Verificar estructura de la tabla client (antigua)
SELECT '=== ESTRUCTURA TABLA client (ANTIGUA) ===' as info;
DESCRIBE client;

-- Verificar estructura de la tabla payment (antigua)
SELECT '=== ESTRUCTURA TABLA payment (ANTIGUA) ===' as info;
DESCRIBE payment;

-- Verificar estructura de la tabla clients (nueva)
SELECT '=== ESTRUCTURA TABLA clients (NUEVA) ===' as info;
DESCRIBE clients;

-- Verificar estructura de la tabla payments (nueva)
SELECT '=== ESTRUCTURA TABLA payments (NUEVA) ===' as info;
DESCRIBE payments;

-- Verificar estructura de la tabla installations (nueva)
SELECT '=== ESTRUCTURA TABLA installations (NUEVA) ===' as info;
DESCRIBE installations;

-- Verificar estructura de la tabla client_payment_configs (nueva)
SELECT '=== ESTRUCTURA TABLA client_payment_configs (NUEVA) ===' as info;
DESCRIBE client_payment_configs;

-- =====================================================
-- DATOS DE MUESTRA Y RELACIONES
-- =====================================================

-- Verificar datos de muestra en tabla client
SELECT 
  '=== DATOS MUESTRA TABLA client ===' as info,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as con_id,
  COUNT(CASE WHEN dni IS NOT NULL THEN 1 END) as con_dni,
  COUNT(CASE WHEN initialPaymentDate IS NOT NULL THEN 1 END) as con_fecha_inicial,
  COUNT(CASE WHEN paymentDate IS NOT NULL THEN 1 END) as con_fecha_pago
FROM client;

-- Verificar datos de muestra en tabla payment
SELECT 
  '=== DATOS MUESTRA TABLA payment ===' as info,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN id IS NOT NULL THEN 1 END) as con_id,
  COUNT(CASE WHEN clientId IS NOT NULL THEN 1 END) as con_client_id,
  COUNT(CASE WHEN dueDate IS NOT NULL THEN 1 END) as con_fecha_vencimiento,
  COUNT(CASE WHEN paymentDate IS NOT NULL THEN 1 END) as con_fecha_pago
FROM payment;

-- Verificar relación entre client y payment
SELECT 
  '=== RELACIÓN client-payment (PRIMEROS 10) ===' as info;
  
SELECT 
  c.id as client_id,
  c.dni,
  c.name,
  COUNT(p.id) as total_pagos,
  MIN(p.dueDate) as min_due_date,
  MAX(p.dueDate) as max_due_date
FROM client c
LEFT JOIN payment p ON p.clientId = c.id
GROUP BY c.id, c.dni, c.name
LIMIT 10;

-- Verificar si existen las nuevas tablas
SELECT '=== VERIFICACIÓN EXISTENCIA TABLAS NUEVAS ===' as info;

SELECT 
  TABLE_NAME as tabla,
  CASE 
    WHEN TABLE_NAME IS NOT NULL THEN 'EXISTE'
    ELSE 'NO EXISTE'
  END as estado
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'group_hemmy' 
AND TABLE_NAME IN ('clients', 'payments', 'installations', 'client_payment_configs');

-- Verificar columnas específicas en tabla client
SELECT '=== COLUMNAS ESPECÍFICAS TABLA client ===' as info;
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'group_hemmy' 
AND TABLE_NAME = 'client'
AND COLUMN_NAME IN ('id', 'dni', 'name', 'initialPaymentDate', 'paymentDate', 'advancePayment');

-- Verificar columnas específicas en tabla payment
SELECT '=== COLUMNAS ESPECÍFICAS TABLA payment ===' as info;
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'group_hemmy' 
AND TABLE_NAME = 'payment'
AND COLUMN_NAME IN ('id', 'clientId', 'dueDate', 'paymentDate', 'amount', 'status');
