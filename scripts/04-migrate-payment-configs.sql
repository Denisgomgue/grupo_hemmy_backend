-- =====================================================
-- PASO 4: MIGRAR CONFIGURACIONES DE PAGO (CORREGIDO)
-- =====================================================

-- Migración de client → client_payment_configs con lógica CORREGIDA
INSERT INTO client_payment_configs (
  installationId,
  initialPaymentDate,
  advancePayment,
  paymentStatus,
  created_at,
  updated_at
)
SELECT
  i.id AS installationId,
  -- 🎯 LÓGICA CORREGIDA: initialPaymentDate = MIN(dueDate) de todos los pagos
  CASE 
    WHEN c.initialPaymentDate IS NOT NULL THEN c.initialPaymentDate
    WHEN EXISTS (
      SELECT 1 FROM payment p2 
      WHERE p2.clientId = c.id  -- ← CORREGIDO: usar c.id en lugar de c.clientId
      AND p2.dueDate IS NOT NULL
    ) THEN
      -- ✅ CLIENTE CON PAGOS: Usar la fecha de vencimiento más antigua
      (
        SELECT MIN(p2.dueDate)  -- ← Solo MIN(dueDate), sin cálculos adicionales
        FROM payment p2 
        WHERE p2.clientId = c.id  -- ← CORREGIDO: usar c.id en lugar de c.clientId
        AND p2.dueDate IS NOT NULL
      )
    ELSE 
      -- ✅ CLIENTE SIN PAGOS: Usar paymentDate como fecha inicial
      c.paymentDate
  END AS initialPaymentDate,
  -- 🎯 VALIDAR advancePayment
  COALESCE(c.advancePayment, 0) AS advancePayment,
  -- 🎯 CALCULAR paymentStatus BASADO EN DATOS EXISTENTES
  CASE 
    WHEN c.initialPaymentDate IS NOT NULL OR c.paymentDate IS NOT NULL THEN 'ACTIVE'
    ELSE 'PENDING'
  END AS paymentStatus,
  CURRENT_TIMESTAMP AS created_at,
  CURRENT_TIMESTAMP AS updated_at
FROM client c
JOIN clients cl ON c.dni = cl.dni
LEFT JOIN installations i ON i.clientId = cl.id
WHERE cl.id IS NOT NULL  -- Solo migrar si el cliente existe
ON DUPLICATE KEY UPDATE
  initialPaymentDate = VALUES(initialPaymentDate),
  advancePayment = VALUES(advancePayment),
  paymentStatus = VALUES(paymentStatus),
  updated_at = CURRENT_TIMESTAMP;

-- Verificar migración de configuraciones de pago
SELECT 
  'Configuraciones de Pago' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN initialPaymentDate IS NOT NULL THEN 1 END) as con_fecha_inicial,
  COUNT(CASE WHEN advancePayment > 0 THEN 1 END) as con_pago_adelantado,
  COUNT(CASE WHEN paymentStatus = 'ACTIVE' THEN 1 END) as activos,
  COUNT(CASE WHEN paymentStatus = 'PENDING' THEN 1 END) as pendientes
FROM client_payment_configs;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigratePaymentConfigsCorrected', 'COMPLETED');

COMMIT;