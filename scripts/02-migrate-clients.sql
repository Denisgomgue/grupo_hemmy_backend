-- =====================================================
-- PASO 2: MIGRAR CLIENTES
-- =====================================================

-- Migración de client → clients
INSERT INTO clients (
  id,
  name,
  lastName,
  dni,
  phone,
  address,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  name,
  lastName,
  dni,
  phone,
  address,
  status,
  created_at,
  updated_at
FROM client
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  lastName = VALUES(lastName),
  phone = VALUES(phone),
  address = VALUES(address),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigrateClients', 'COMPLETED');

COMMIT; 