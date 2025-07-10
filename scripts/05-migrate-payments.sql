-- =====================================================
-- PASO 5: MIGRAR PAGOS
-- =====================================================

-- Migración de payment → payments
INSERT INTO payments (
  id,
  paymentDate,
  reference,
  reconnection,
  amount,
  status,
  paymentType,
  transfername,
  discount,
  dueDate,
  created_at,
  updated_at,
  clientId,
  reconnectionFee,
  baseAmount,
  code,
  isVoided,
  voidedAt,
  voidedReason
)
SELECT
  p.id,
  p.paymentDate,
  p.reference,
  p.reconnection,
  p.amount,
  p.state,
  p.paymentType,
  p.transfername,
  p.discount,
  p.dueDate,
  p.created_At,
  p.updated_At,
  cl.id AS clientId,
  p.reconnectionFee,
  p.baseAmount,
  p.code,
  p.isVoided,
  p.voidedAt,
  p.voidedReason
FROM payment p
JOIN client c ON p.clientId = c.id
JOIN clients cl ON c.dni = cl.dni
ON DUPLICATE KEY UPDATE
  paymentDate = VALUES(paymentDate),
  reference = VALUES(reference),
  reconnection = VALUES(reconnection),
  amount = VALUES(amount),
  status = VALUES(status),
  paymentType = VALUES(paymentType),
  transfername = VALUES(transfername),
  discount = VALUES(discount),
  dueDate = VALUES(dueDate),
  clientId = VALUES(clientId),
  reconnectionFee = VALUES(reconnectionFee),
  baseAmount = VALUES(baseAmount),
  code = VALUES(code),
  isVoided = VALUES(isVoided),
  voidedAt = VALUES(voidedAt),
  voidedReason = VALUES(voidedReason),
  updated_at = CURRENT_TIMESTAMP;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigratePayments', 'COMPLETED');

COMMIT; 