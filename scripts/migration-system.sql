-- =====================================================
-- SISTEMA DE MIGRACIÓN GRUPO HEMMY
-- Transformación de estructura de base de datos
-- =====================================================

-- Configuración inicial
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- =====================================================
-- PASO 1: CREAR TABLA DE CONTROL DE MIGRACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED') DEFAULT 'PENDING',
  `error_message` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- =====================================================
-- PASO 2: CREAR TABLAS NUEVAS (SI NO EXISTEN)
-- =====================================================

-- Tabla clients (nueva estructura)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED','INACTIVE') DEFAULT 'ACTIVE',
  `birthdate` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_dni_unique` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- Tabla installations
CREATE TABLE IF NOT EXISTS `installations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `installationDate` date NOT NULL,
  `reference` text DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL,
  `referenceImage` varchar(255) DEFAULT NULL,
  `clientId` int(11) NOT NULL,
  `planId` int(11) NOT NULL,
  `sectorId` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_installations_client` (`clientId`),
  KEY `FK_installations_plan` (`planId`),
  KEY `FK_installations_sector` (`sectorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- Tabla client_payment_configs
CREATE TABLE IF NOT EXISTS `client_payment_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `installationId` int(11) NOT NULL,
  `initialPaymentDate` date DEFAULT NULL,
  `advancePayment` tinyint(1) DEFAULT 0,
  `paymentStatus` enum('SUSPENDED','EXPIRING','EXPIRED','PAID') DEFAULT 'PAID',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_installation_config` (`installationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- Tabla payments (nueva estructura)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `reconnection` tinyint(1) NOT NULL DEFAULT 0,
  `amount` decimal(10,2) NOT NULL,
  `baseAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reconnectionFee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `state` enum('PENDING','PAYMENT_DAILY','LATE_PAYMENT','VOIDED') DEFAULT NULL,
  `paymentType` enum('TRANSFER','CASH','YAPE','PLIN','OTHER') DEFAULT NULL,
  `transfername` varchar(255) DEFAULT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `dueDate` datetime DEFAULT NULL,
  `isVoided` tinyint(1) NOT NULL DEFAULT 0,
  `voidedAt` datetime DEFAULT NULL,
  `voidedReason` varchar(255) DEFAULT NULL,
  `clientId` int(11) DEFAULT NULL,
  `engagementDate` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_payments_client` (`clientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- Tabla payment_histories
CREATE TABLE IF NOT EXISTS `payment_histories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paymentId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `type` enum('PAYMENT','VOID','ADJUSTMENT') DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `dueDate` date DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `engagementDate` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_payment_histories_payment` (`paymentId`),
  KEY `FK_payment_histories_client` (`clientId`),
  KEY `FK_payment_histories_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- Tabla devices
CREATE TABLE IF NOT EXISTS `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serialNumber` varchar(255) NOT NULL,
  `macAddress` varchar(100) DEFAULT NULL,
  `type` enum('router','deco','ont','switch','laptop','crimpadora','tester','antena','fibra','conector','otro') DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `status` enum('STOCK','ASSIGNED','SOLD','MAINTENANCE','LOST','SCRAPPED') DEFAULT NULL,
  `assignedDate` date DEFAULT NULL,
  `useType` enum('CLIENT','EMPLOYEE','COMPANY','CONSUMABLE') DEFAULT NULL,
  `assignedClientId` int(11) DEFAULT NULL,
  `assignedEmployeeId` int(11) DEFAULT NULL,
  `assignedInstallationId` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_serial_number` (`serialNumber`),
  KEY `FK_devices_client` (`assignedClientId`),
  KEY `FK_devices_employee` (`assignedEmployeeId`),
  KEY `FK_devices_installation` (`assignedInstallationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- Tabla employees
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `roleId` int(11) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_employee_dni` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- =====================================================
-- PASO 3: MIGRACIÓN DE DATOS
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

-- Migración de payment → payments
INSERT INTO payments (
  id,
  paymentDate,
  reference,
  reconnection,
  amount,
  state,
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
  state = VALUES(state),
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

-- =====================================================
-- PASO 4: AGREGAR RESTRICCIONES DE CLAVE FORÁNEA
-- =====================================================

-- Restricciones para installations
ALTER TABLE installations
ADD CONSTRAINT `FK_installations_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_installations_plan` FOREIGN KEY (`planId`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_installations_sector` FOREIGN KEY (`sectorId`) REFERENCES `sectors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Restricciones para client_payment_configs
ALTER TABLE client_payment_configs
ADD CONSTRAINT `FK_payment_config_installation` FOREIGN KEY (`installationId`) REFERENCES `installations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Restricciones para payments
ALTER TABLE payments
ADD CONSTRAINT `FK_payments_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Restricciones para payment_histories
ALTER TABLE payment_histories
ADD CONSTRAINT `FK_payment_histories_payment` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_payment_histories_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `FK_payment_histories_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Restricciones para devices
ALTER TABLE devices
ADD CONSTRAINT `FK_devices_client` FOREIGN KEY (`assignedClientId`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_devices_employee` FOREIGN KEY (`assignedEmployeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `FK_devices_installation` FOREIGN KEY (`assignedInstallationId`) REFERENCES `installations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Restricciones para employees
ALTER TABLE employees
ADD CONSTRAINT `FK_employees_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================
-- PASO 5: LIMPIEZA DE TABLAS ANTIGUAS
-- =====================================================

-- Eliminar tablas antiguas (solo después de verificar que la migración fue exitosa)
-- DROP TABLE IF EXISTS `payment_history`;
-- DROP TABLE IF EXISTS `payment`;
-- DROP TABLE IF EXISTS `client`;

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
COMMIT;

-- Registrar migración como completada
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'CompleteDatabaseMigration', 'COMPLETED'); 