-- =====================================================
-- PASO 6: MIGRAR HISTORIAL DE PAGOS
-- =====================================================

-- Migración de payment_history → payment_histories
INSERT INTO payment_histories (
  amount,
  discount,
  paymentDate,
  dueDate,
  reference,
  paymentId,
  clientId,
  userId,
  created_at
)
SELECT
  ph.amount,
  ph.discount,
  ph.paymentDate,
  ph.dueDate,
  ph.reference,
  p.id AS paymentId,
  cl.id AS clientId,
  ph.userId,
  ph.created_At
FROM payment_history ph
JOIN payment p ON ph.paymentId = p.id
JOIN client c ON p.clientId = c.id
JOIN clients cl ON c.dni = cl.dni
ON DUPLICATE KEY UPDATE
  amount = VALUES(amount),
  discount = VALUES(discount),
  paymentDate = VALUES(paymentDate),
  dueDate = VALUES(dueDate),
  reference = VALUES(reference),
  updated_at = CURRENT_TIMESTAMP;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigratePaymentHistories', 'COMPLETED');

COMMIT; 