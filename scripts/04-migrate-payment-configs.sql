-- =====================================================
-- PASO 4: MIGRAR CONFIGURACIONES DE PAGO
-- =====================================================

-- Migración de client → client_payment_configs
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
  c.initialPaymentDate,
  c.advancePayment,
  c.paymentStatus,
  c.created_at,
  c.updated_at
FROM client c
JOIN clients cl ON c.dni = cl.dni
JOIN installations i ON i.clientId = cl.id
ON DUPLICATE KEY UPDATE
  initialPaymentDate = VALUES(initialPaymentDate),
  advancePayment = VALUES(advancePayment),
  paymentStatus = VALUES(paymentStatus),
  updated_at = CURRENT_TIMESTAMP;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigratePaymentConfigs', 'COMPLETED');

COMMIT; 