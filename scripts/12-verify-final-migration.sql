-- =====================================================
-- PASO 12: VERIFICACIÓN FINAL DE MIGRACIÓN (MEJORADA)
-- =====================================================

-- Verificar integridad de la migración
SELECT '=== VERIFICACIÓN FINAL DE MIGRACIÓN ===' as info;

-- 1. Verificar clientes
SELECT 
  'Clientes' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN dni IS NOT NULL THEN 1 END) as con_dni,
  COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as con_nombre
FROM clients;

-- 2. Verificar instalaciones
SELECT 
  'Instalaciones' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN clientId IS NOT NULL THEN 1 END) as con_cliente,
  COUNT(CASE WHEN planId IS NOT NULL THEN 1 END) as con_plan
FROM installations;

-- 3. Verificar configuraciones de pago
SELECT 
  'Configuraciones de Pago' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN initialPaymentDate IS NOT NULL THEN 1 END) as con_fecha_inicial,
  COUNT(CASE WHEN paymentStatus = 'ACTIVE' THEN 1 END) as activos
FROM client_payment_configs;

-- 4. Verificar pagos
SELECT 
  'Pagos' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN clientId IS NOT NULL THEN 1 END) as con_cliente,
  COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as con_status
FROM payments;

-- 5. Verificar clientes sin fecha inicial de pago
SELECT 
  'Clientes sin fecha inicial' as problema,
  COUNT(*) as cantidad
FROM clients c
LEFT JOIN installations i ON i.clientId = c.id
LEFT JOIN client_payment_configs cpc ON cpc.installationId = i.id
WHERE cpc.initialPaymentDate IS NULL;

-- 6. Verificar pagos sin fecha de vencimiento
SELECT 
  'Pagos sin fecha de vencimiento' as problema,
  COUNT(*) as cantidad
FROM payments
WHERE dueDate IS NULL;

-- 7. 🎯 NUEVA VERIFICACIÓN: Validar lógica de initialPaymentDate
SELECT 
  'Validación de lógica initialPaymentDate' as verificacion,
  COUNT(*) as total_clientes,
  COUNT(CASE WHEN cpc.initialPaymentDate IS NOT NULL THEN 1 END) as con_fecha_inicial,
  COUNT(CASE WHEN p_count.total_pagos > 0 THEN 1 END) as clientes_con_pagos,
  COUNT(CASE WHEN p_count.total_pagos = 0 THEN 1 END) as clientes_sin_pagos
FROM clients c
LEFT JOIN installations i ON i.clientId = c.id
LEFT JOIN client_payment_configs cpc ON cpc.installationId = i.id
LEFT JOIN (
  SELECT 
    clientId, 
    COUNT(*) as total_pagos,
    MIN(dueDate) as min_due_date
  FROM payments 
  GROUP BY clientId
) p_count ON p_count.clientId = c.id;

-- 8. 🎯 NUEVA VERIFICACIÓN: Verificar consistencia de fechas
SELECT 
  'Consistencia de fechas' as verificacion,
  c.id as cliente_id,
  c.name,
  cpc.initialPaymentDate,
  p_count.min_due_date,
  CASE 
    WHEN p_count.total_pagos > 0 AND cpc.initialPaymentDate != p_count.min_due_date THEN 'INCONSISTENTE'
    ELSE 'CONSISTENTE'
  END as estado
FROM clients c
LEFT JOIN installations i ON i.clientId = c.id
LEFT JOIN client_payment_configs cpc ON cpc.installationId = i.id
LEFT JOIN (
  SELECT 
    clientId, 
    COUNT(*) as total_pagos,
    MIN(dueDate) as min_due_date
  FROM payments 
  GROUP BY clientId
) p_count ON p_count.clientId = c.id
WHERE p_count.total_pagos > 0
LIMIT 10;

-- 🎯 VERIFICACIÓN: Contar configuraciones por estado
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN paymentStatus = 'PAID' THEN 1 END) as pagados,
    COUNT(CASE WHEN paymentStatus = 'EXPIRED' THEN 1 END) as expirados,
    COUNT(CASE WHEN paymentStatus = 'EXPIRING' THEN 1 END) as por_vencer,
    COUNT(CASE WHEN paymentStatus = 'SUSPENDED' THEN 1 END) as suspendidos
FROM client_payment_configs;

-- Registrar verificación completada
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'VerifyFinalMigrationImproved', 'COMPLETED');

COMMIT;