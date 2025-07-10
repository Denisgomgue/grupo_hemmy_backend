-- =====================================================
-- PASO 3: MIGRAR INSTALACIONES
-- =====================================================

-- Migración de client → installations
INSERT INTO installations (
  installationDate,
  reference,
  ipAddress,
  referenceImage,
  clientId,
  planId,
  sectorId,
  created_at,
  updated_at
)
SELECT
  DATE(c.installationDate) as installationDate,
  c.description as reference,
  c.ipAddress,
  c.referenceImage,
  cl.id AS clientId,
  c.planId,
  c.sectorId,
  c.created_at,
  c.updated_at
FROM client c
JOIN clients cl ON c.dni = cl.dni
ON DUPLICATE KEY UPDATE
  reference = VALUES(reference),
  ipAddress = VALUES(ipAddress),
  referenceImage = VALUES(referenceImage),
  updated_at = CURRENT_TIMESTAMP;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigrateInstallations', 'COMPLETED');

COMMIT; 