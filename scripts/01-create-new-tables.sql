-- =====================================================
-- PASO 1: CREAR TABLAS NUEVAS
-- =====================================================

-- Configuración inicial
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET AUTOCOMMIT = 0;

-- Crear tabla de control de migraciones
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','RUNNING','COMPLETED','FAILED') DEFAULT 'PENDING',
  `error_message` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

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

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'CreateNewTables', 'COMPLETED');

COMMIT; 