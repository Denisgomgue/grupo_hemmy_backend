-- =====================================================
-- PASO 5: MIGRAR PAGOS (CORREGIDO)
-- =====================================================

-- Migración de payment → payments con cálculo CORREGIDO de fechas
INSERT INTO payments (
  id,
  paymentDate,
  reference,
  reconnection,
  amount,
  -- 🎯 CALCULAR STATUS BASADO EN FECHAS
  status,
  paymentType,
  transfername,
  discount,
  -- 🎯 CALCULAR FECHA DE VENCIMIENTO CORRECTAMENTE
  dueDate,
  created_at,
  updated_at,
  clientId,
  reconnectionFee,
  baseAmount,
  -- 🎯 GENERAR CÓDIGO ÚNICO SI NO EXISTE
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
  -- 🎯 CALCULAR STATUS BASADO EN FECHAS
  CASE 
    WHEN p.paymentDate IS NOT NULL AND p.dueDate IS NOT NULL THEN
      CASE 
        WHEN p.paymentDate <= p.dueDate THEN 'PAYMENT_DAILY'
        ELSE 'LATE_PAYMENT'
      END
    ELSE 'PENDING'
  END AS status,
  p.paymentType,
  p.transfername,
  p.discount,
  -- 🎯 CALCULAR FECHA DE VENCIMIENTO CORRECTAMENTE
  COALESCE(
    p.dueDate,
    -- 🚨 CORRECCIÓN: Calcular basado en initialPaymentDate REAL (MIN de dueDate)
    CASE 
      WHEN cpc.initialPaymentDate IS NOT NULL THEN 
        DATE_ADD(
          cpc.initialPaymentDate, 
          INTERVAL (
            SELECT COUNT(*) 
            FROM payment p2 
            WHERE p2.clientId = p.clientId 
            AND p2.id <= p.id
          ) MONTH
        )
      ELSE 
        DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH)
    END
  ) AS dueDate,
  p.created_At,
  p.updated_At,
  cl.id AS clientId,
  p.reconnectionFee,
  p.baseAmount,
  -- 🎯 GENERAR CÓDIGO ÚNICO SI NO EXISTE
  COALESCE(p.code, CONCAT('PG-', cl.id, '-', LPAD(p.id, 4, '0'))) AS code,
  p.isVoided,
  p.voidedAt,
  p.voidedReason
FROM payment p
JOIN client c ON p.clientId = c.id
JOIN clients cl ON c.dni = cl.dni
LEFT JOIN installations i ON i.clientId = cl.id
LEFT JOIN client_payment_configs cpc ON cpc.installationId = i.id
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

-- Verificar migración de pagos
SELECT 
  'Pagos' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'PAYMENT_DAILY' THEN 1 END) as pagos_al_dia,
  COUNT(CASE WHEN status = 'LATE_PAYMENT' THEN 1 END) as pagos_atrasados,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pagos_pendientes,
  COUNT(CASE WHEN isVoided = TRUE THEN 1 END) as pagos_anulados,
  COUNT(CASE WHEN dueDate IS NOT NULL THEN 1 END) as con_fecha_vencimiento
FROM payments;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigratePaymentsCorrected', 'COMPLETED');

COMMIT;