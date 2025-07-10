-- =====================================================
-- PASO 7: MIGRAR DISPOSITIVOS
-- =====================================================

-- Migración de dispositivos desde client.routerSerial
INSERT INTO devices (
  serialNumber,
  type,
  status,
  assignedDate,
  useType,
  assignedClientId,
  assignedInstallationId,
  created_at,
  updated_at
)
SELECT
  c.routerSerial,
  'router',
  'ASSIGNED',
  DATE(c.created_at),
  'CLIENT',
  cl.id AS assignedClientId,
  i.id AS assignedInstallationId,
  c.created_at,
  c.updated_at
FROM client c
JOIN clients cl ON c.dni = cl.dni
JOIN installations i ON i.clientId = cl.id
WHERE c.routerSerial IS NOT NULL AND c.routerSerial <> ''
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  assignedDate = VALUES(assignedDate),
  useType = VALUES(useType),
  assignedClientId = VALUES(assignedClientId),
  assignedInstallationId = VALUES(assignedInstallationId),
  updated_at = CURRENT_TIMESTAMP;

-- Migración de dispositivos desde client.decoSerial
INSERT INTO devices (
  serialNumber,
  type,
  status,
  assignedDate,
  useType,
  assignedClientId,
  assignedInstallationId,
  created_at,
  updated_at
)
SELECT
  c.decoSerial,
  'deco',
  'ASSIGNED',
  DATE(c.created_at),
  'CLIENT',
  cl.id AS assignedClientId,
  i.id AS assignedInstallationId,
  c.created_at,
  c.updated_at
FROM client c
JOIN clients cl ON c.dni = cl.dni
JOIN installations i ON i.clientId = cl.id
WHERE c.decoSerial IS NOT NULL AND c.decoSerial <> ''
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  assignedDate = VALUES(assignedDate),
  useType = VALUES(useType),
  assignedClientId = VALUES(assignedClientId),
  assignedInstallationId = VALUES(assignedInstallationId),
  updated_at = CURRENT_TIMESTAMP;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigrateDevices', 'COMPLETED');

COMMIT; 