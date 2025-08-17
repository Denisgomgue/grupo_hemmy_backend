-- =====================================================
-- PASO 3: MIGRAR INSTALACIONES (MEJORADO)
-- =====================================================

-- Migración de client → installations con validación mejorada
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
  -- 🎯 VALIDAR FECHA DE INSTALACIÓN
  CASE 
    WHEN c.installationDate IS NOT NULL THEN DATE(c.installationDate)
    WHEN c.created_at IS NOT NULL THEN DATE(c.created_at)
    ELSE CURRENT_DATE
  END AS installationDate,
  -- Usar description como reference, o crear uno por defecto
  COALESCE(c.description, CONCAT('Instalación cliente ', cl.name, ' ', cl.lastName)) AS reference,
  c.ipAddress,
  c.referenceImage,
  cl.id AS clientId,
  -- 🎯 VALIDAR planId
  CASE 
    WHEN c.planId IS NOT NULL THEN c.planId
    ELSE (SELECT id FROM plans LIMIT 1) -- Plan por defecto
  END AS planId,
  -- �� VALIDAR sectorId
  CASE 
    WHEN c.sectorId IS NOT NULL THEN c.sectorId
    ELSE (SELECT id FROM sectors LIMIT 1) -- Sector por defecto
  END AS sectorId,
  CURRENT_TIMESTAMP AS created_at,
  CURRENT_TIMESTAMP AS updated_at
FROM client c
JOIN clients cl ON c.dni = cl.dni
WHERE cl.id IS NOT NULL  -- Solo migrar si el cliente existe
ON DUPLICATE KEY UPDATE
  reference = VALUES(reference),
  ipAddress = VALUES(ipAddress),
  referenceImage = VALUES(referenceImage),
  planId = VALUES(planId),
  sectorId = VALUES(sectorId),
  updated_at = CURRENT_TIMESTAMP;

-- Verificar migración de instalaciones
SELECT 
  'Instalaciones' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN installationDate IS NOT NULL THEN 1 END) as con_fecha_instalacion,
  COUNT(CASE WHEN planId IS NOT NULL THEN 1 END) as con_plan,
  COUNT(CASE WHEN sectorId IS NOT NULL THEN 1 END) as con_sector,
  COUNT(CASE WHEN reference IS NOT NULL THEN 1 END) as con_referencia
FROM installations;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'MigrateInstallationsImproved', 'COMPLETED');

COMMIT;