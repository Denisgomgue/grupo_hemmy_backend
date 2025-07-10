-- MySQL dump 10.13  Distrib 8.0.37, for Win64 (x86_64)
--
-- Host: localhost    Database: group_hemmy
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `installationDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `advancePayment` tinyint(4) DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `planId` int(11) DEFAULT NULL,
  `sectorId` int(11) DEFAULT NULL,
  `routerSerial` varchar(255) DEFAULT NULL,
  `decoSerial` varchar(255) DEFAULT NULL,
  `paymentStatus` enum('SUSPENDED','EXPIRING','EXPIRED','PAID') NOT NULL,
  `referenceImage` varchar(255) DEFAULT NULL,
  `initialPaymentDate` datetime DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fb529f57900726838c410fa83d` (`dni`),
  KEY `FK_bcf9ab88c1c1ec520623e7856c1` (`planId`),
  KEY `FK_9ddf6e81411dd6a67013009281a` (`sectorId`),
  CONSTRAINT `FK_9ddf6e81411dd6a67013009281a` FOREIGN KEY (`sectorId`) REFERENCES `sectors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_bcf9ab88c1c1ec520623e7856c1` FOREIGN KEY (`planId`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (1,'Mery Blanca','Chinchay Gomez','41663054','951376951','Carrtera Huantallon','2025-04-29 00:00:00','Antes de a plaza de armas','2025-05-29 00:00:00',1,'ACTIVE','Casa 3 pisos','2025-05-05 09:39:26.956751','2025-06-07 15:53:40.000000',2,2,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(2,'Yuli Julissa','Rímac López','75524515','987780017','Calle la soledad s/n','2025-05-04 05:00:00','antes capilla','2025-06-05 05:00:00',1,'SUSPENDED','','2025-05-05 11:59:42.113875','2025-07-08 18:57:43.000000',2,2,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(3,'Miguel Angel','Regaldo Palma','74357705','948954927','Carretera Huaraz - Caraz ','2025-05-03 05:00:00','Antes del puente de Mullaca','2025-07-03 00:00:00',1,'ACTIVE','','2025-05-05 14:50:45.821721','2025-07-08 18:57:43.000000',2,3,NULL,NULL,'EXPIRED',NULL,NULL,NULL),(4,'Eberth Gabriel','Minaya Garcia','44825378','943900818','Carreterea Huaraz - Caraz','2025-05-03 05:00:00','Pasando 2do Puente - Uchuyacu','2025-06-03 05:00:00',1,'SUSPENDED','FERRETERIA TECHO ROJO','2025-05-05 20:20:40.249991','2025-06-11 23:09:09.000000',2,4,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(5,'Grescia ','Evangelina Salvador','60858237','991438074','Carretera San Miguel','2025-04-29 00:00:00','Segunda Curva','2025-05-28 00:00:00',0,'SUSPENDED','','2025-05-05 20:26:42.541257','2025-06-11 23:09:09.000000',3,9,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(6,'Edinson ','Atoc Obregon','71926248','928028535','Jr. Miguel Grau ','2025-04-29 00:00:00','Una cuadra despues de la plaza','2025-05-28 00:00:00',1,'SUSPENDED','','2025-05-05 20:30:56.269864','2025-06-11 23:09:09.000000',3,10,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(7,'Lenin','Linares Leiva','75671429','938231126','Carretera Musho - Tumpa','2025-03-24 05:00:00','Frente a la Puerta Principal del Colegio Musho','2025-05-24 00:00:00',1,'SUSPENDED','','2025-05-08 22:47:28.559995','2025-06-11 23:09:09.000000',3,10,'223C9H6002801','-','SUSPENDED',NULL,NULL,NULL),(8,'Hiber Victor ','Alva Pachas','33342491','943499360','Av. Monterrey Nro. 4997','2025-01-09 05:00:00','Maderera rio santa','2025-02-09 05:00:00',0,'ACTIVE','','2025-05-09 14:17:06.679041','2025-05-09 14:17:06.679041',2,6,'48575443E82234AC','','SUSPENDED',NULL,NULL,NULL),(9,'Flor ','Maguiña Ayala','45889852','910670128','Carrterera Huaraz - Caraz ','2025-03-15 05:00:00','Mullaca','2025-05-15 00:00:00',0,'ACTIVE','','2025-05-09 14:26:40.545883','2025-05-23 17:36:49.000000',2,3,'','','SUSPENDED',NULL,NULL,NULL),(10,'Keyvin Justo','Minaya Picon','75261732','935224372','Primer entrada a Huantallon','2025-04-08 05:00:00','Casa Rustico','2025-07-07 00:00:00',0,'ACTIVE','','2025-05-09 14:32:25.642064','2025-07-08 18:57:43.000000',2,2,'','','EXPIRED',NULL,NULL,NULL),(11,'Alex Manuel ','Blas Colonia ','46262455','976732200','Carretera Huantallon','2025-04-22 00:00:00','Antes de Voltear a la Iglesia ','2025-06-21 00:00:00',1,'SUSPENDED','','2025-05-09 14:44:18.073177','2025-07-08 18:57:43.000000',2,2,'09B192AA','','SUSPENDED',NULL,NULL,NULL),(12,'Daniel Jesus ','Chavez Javier','44049492','978208097','Caserio Santa Rosa','2025-03-29 05:00:00','Primer Rompemuelle','2025-05-29 00:00:00',1,'SUSPENDED','','2025-05-09 14:55:28.852989','2025-06-11 23:09:09.000000',2,5,'','','SUSPENDED',NULL,NULL,NULL),(13,'Denis Patricia ','Cashpa Vega','47104542','924132661','Centro Poblado de Tumpa ','2025-03-09 12:00:00','Costado del Colegio de Tumpa','2025-06-07 12:00:00',0,'SUSPENDED','','2025-05-09 18:58:36.544478','2025-07-08 18:54:08.000000',1,10,'','','SUSPENDED',NULL,NULL,'192.65.123.0');
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_payment_configs`
--

DROP TABLE IF EXISTS `client_payment_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_payment_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `installationId` int(11) NOT NULL,
  `initialPaymentDate` date DEFAULT NULL,
  `advancePayment` tinyint(1) DEFAULT 0,
  `paymentStatus` enum('SUSPENDED','EXPIRING','EXPIRED','PAID') DEFAULT 'PAID',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_installation_config` (`installationId`),
  KEY `fk_payment_config_installation` (`installationId`),
  CONSTRAINT `fk_payment_config_installation` FOREIGN KEY (`installationId`) REFERENCES `installations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_payment_configs`
--

LOCK TABLES `client_payment_configs` WRITE;
/*!40000 ALTER TABLE `client_payment_configs` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_payment_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
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
  UNIQUE KEY `unique_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
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
  UNIQUE KEY `unique_serial_number` (`serialNumber`),
  KEY `fk_devices_client` (`assignedClientId`),
  KEY `fk_devices_employee` (`assignedEmployeeId`),
  KEY `fk_devices_installation` (`assignedInstallationId`),
  CONSTRAINT `fk_devices_client` FOREIGN KEY (`assignedClientId`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_devices_employee` FOREIGN KEY (`assignedEmployeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_devices_installation` FOREIGN KEY (`assignedInstallationId`) REFERENCES `installations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `roleId` int(11) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_dni` (`dni`),
  KEY `fk_employees_role` (`roleId`),
  CONSTRAINT `fk_employees_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `installations`
--

DROP TABLE IF EXISTS `installations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `installations` (
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
  KEY `fk_installations_client` (`clientId`),
  KEY `fk_installations_plan` (`planId`),
  KEY `fk_installations_sector` (`sectorId`),
  CONSTRAINT `fk_installations_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_installations_plan` FOREIGN KEY (`planId`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_installations_sector` FOREIGN KEY (`sectorId`) REFERENCES `sectors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `installations`
--

LOCK TABLES `installations` WRITE;
/*!40000 ALTER TABLE `installations` DISABLE KEYS */;
/*!40000 ALTER TABLE `installations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paymentDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `reconnection` tinyint(4) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `state` enum('PENDING','PAYMENT_DAILY','LATE_PAYMENT','VOIDED') DEFAULT NULL,
  `paymentType` enum('TRANSFER','CASH','YAPE','PLIN','OTHER') DEFAULT NULL,
  `transfername` varchar(255) DEFAULT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `dueDate` datetime DEFAULT NULL,
  `created_At` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_At` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `clientId` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `baseAmount` decimal(10,2) NOT NULL,
  `reconnectionFee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `isVoided` tinyint(4) NOT NULL DEFAULT 0,
  `voidedAt` datetime DEFAULT NULL,
  `voidedReason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bbbabef6ffa9572acb68cb0f217` (`clientId`),
  CONSTRAINT `FK_bbbabef6ffa9572acb68cb0f217` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,'2025-05-08 05:00:00','04181115',0,50.00,'LATE_PAYMENT','YAPE','Mily Hidalgo - 04181115',0.00,'2025-04-24 05:00:00','2025-05-08 22:50:11.348659','2025-06-11 23:13:19.000000',7,'PG-LL1429-0001',0.00,0.00,0,NULL,NULL),(2,'2025-05-09 05:00:00','04760728',0,50.00,'LATE_PAYMENT','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-04-15 05:00:00','2025-05-09 14:28:07.934871','2025-06-11 23:13:19.000000',9,'PG-FM9852-0001',0.00,0.00,0,NULL,NULL),(4,'2025-05-09 05:00:00','04240636',0,50.00,'PAYMENT_DAILY','TRANSFER','GRUPO HEMMY EIRL',0.00,'2025-05-21 05:00:00','2025-05-09 14:47:52.198525','2025-06-11 23:13:19.000000',11,'PG-AB2455-0001',0.00,0.00,0,NULL,NULL),(5,'2025-05-09 05:00:00','09640137',0,50.00,'PAYMENT_DAILY','YAPE','MILY HIDALGO ROJAS',0.00,'2025-06-07 05:00:00','2025-05-09 14:49:54.503539','2025-06-11 23:13:19.000000',10,'PG-KM1732-0001',0.00,0.00,0,NULL,NULL),(6,'2025-05-09 05:00:00','03792646',0,50.00,'LATE_PAYMENT','YAPE','MILY HIDALGO ROJAS',0.00,'2025-04-29 05:00:00','2025-05-09 14:57:00.484139','2025-06-11 23:13:19.000000',12,'PG-DC9492-0001',0.00,0.00,0,NULL,NULL),(7,'2025-05-09 05:00:00','01368592',0,80.00,'LATE_PAYMENT','TRANSFER','GRUPO HEMMY EIRL',0.00,'2025-05-08 05:00:00','2025-05-09 19:02:02.841352','2025-06-11 23:13:19.000000',13,'PG-DC4542-0001',0.00,0.00,0,NULL,NULL);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_histories`
--

DROP TABLE IF EXISTS `payment_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_histories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paymentDate` datetime DEFAULT NULL,
  `dueDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `paymentId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `type` enum('PAYMENT','VOID','ADJUSTMENT') DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `engagementDate` date DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_payment_histories_payment` (`paymentId`),
  KEY `fk_payment_histories_client` (`clientId`),
  KEY `fk_payment_histories_user` (`userId`),
  CONSTRAINT `fk_payment_histories_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_histories_payment` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_payment_histories_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_histories`
--

LOCK TABLES `payment_histories` WRITE;
/*!40000 ALTER TABLE `payment_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_history`
--

DROP TABLE IF EXISTS `payment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paymentDate` datetime DEFAULT NULL,
  `dueDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `paymentType` varchar(255) DEFAULT NULL,
  `created_At` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `paymentId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_a3219994ab452282c74ef6de2ca` (`paymentId`),
  KEY `FK_ab67a904aa1c9a7d606feadfa94` (`clientId`),
  KEY `FK_34d643de1a588d2350297da5c24` (`userId`),
  CONSTRAINT `FK_34d643de1a588d2350297da5c24` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_a3219994ab452282c74ef6de2ca` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_ab67a904aa1c9a7d606feadfa94` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_history`
--

LOCK TABLES `payment_history` WRITE;
/*!40000 ALTER TABLE `payment_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paymentDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `reconnection` tinyint(4) NOT NULL DEFAULT 0,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','PAYMENT_DAILY','LATE_PAYMENT','VOIDED') DEFAULT NULL,
  `paymentType` enum('TRANSFER','CASH','YAPE','PLIN','OTHER') DEFAULT NULL,
  `transferName` varchar(255) DEFAULT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `dueDate` datetime DEFAULT NULL,
  `clientId` int(11) DEFAULT NULL,
  `reconnectionFee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `baseAmount` decimal(10,2) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `isVoided` tinyint(4) NOT NULL DEFAULT 0,
  `voidedAt` datetime DEFAULT NULL,
  `voidedReason` varchar(255) DEFAULT NULL,
  `engagementDate` date DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `fk_payments_client` (`clientId`),
  CONSTRAINT `fk_payments_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `routeCode` varchar(255) NOT NULL,
  `actions` text DEFAULT NULL,
  `restrictions` text DEFAULT NULL,
  `isSubRoute` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `speed` int(11) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `update_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `serviceId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ce3ff05254e0f11691025ce68d5` (`serviceId`),
  CONSTRAINT `FK_ce3ff05254e0f11691025ce68d5` FOREIGN KEY (`serviceId`) REFERENCES `service` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,'PLAN 40',40.00,'PLAN ECONOMICO',10,'2025-05-05 09:38:17.223122','2025-05-09 18:59:50.000000',1),(2,'Plan 100 Mbs',50.00,'',100,'2025-05-05 11:54:13.259014','2025-05-05 11:54:13.259014',2),(3,'PLAN 50',50.00,'',10,'2025-05-05 20:27:40.539880','2025-05-05 20:27:40.539880',1);
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role-has-permissions`
--

DROP TABLE IF EXISTS `role-has-permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role-has-permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `routeCode` varchar(255) NOT NULL,
  `actions` text DEFAULT NULL,
  `restrictions` text DEFAULT NULL,
  `isSubRoute` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `permissionId` int(11) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ba740b845484026f71496a044e9` (`permissionId`),
  KEY `FK_233b94cbe69e1a0b745c5295eb1` (`roleId`),
  CONSTRAINT `FK_233b94cbe69e1a0b745c5295eb1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_ba740b845484026f71496a044e9` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role-has-permissions`
--

LOCK TABLES `role-has-permissions` WRITE;
/*!40000 ALTER TABLE `role-has-permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role-has-permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `allowAll` tinyint(4) NOT NULL DEFAULT 0,
  `isPublic` tinyint(4) NOT NULL DEFAULT 0,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','Administrator role with full access',1,0,'2025-05-05 08:08:56.419453','2025-05-05 08:08:56.419453');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sectors`
--

DROP TABLE IF EXISTS `sectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sectors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `update_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1a10b192342e5165948f4dccef` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sectors`
--

LOCK TABLES `sectors` WRITE;
/*!40000 ALTER TABLE `sectors` DISABLE KEYS */;
INSERT INTO `sectors` VALUES (1,'Tarica','','2025-05-05 09:37:34.625280','2025-05-09 14:53:01.000000'),(2,'Huantallon','','2025-05-05 11:44:28.710606','2025-05-05 11:44:28.710606'),(3,'Mullaca','','2025-05-05 11:44:58.332958','2025-05-05 11:44:58.332958'),(4,'Uchuyacu','','2025-05-05 11:45:37.326344','2025-05-05 11:45:37.326344'),(5,'Santa Rosa','','2025-05-05 11:46:02.465900','2025-05-05 11:46:02.465900'),(6,'Monterrey','','2025-05-05 11:46:45.187081','2025-05-05 11:46:45.187081'),(7,'Chavin','','2025-05-05 11:47:21.925758','2025-05-05 11:47:21.925758'),(8,'Carianpampa','','2025-05-05 11:48:03.703310','2025-05-05 11:48:03.703310'),(9,'San Miguel','','2025-05-05 20:28:04.737306','2025-05-05 20:28:04.737306'),(10,'Tumpa','','2025-05-05 20:28:14.581744','2025-05-05 20:28:14.581744');
/*!40000 ALTER TABLE `sectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `update_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
INSERT INTO `service` VALUES (1,'Internet Inalambrico','Inalambrico','ACTIVE','2025-05-05 09:37:51.804630','2025-05-05 09:37:51.804630'),(2,'Fibra Óptica','','ACTIVE','2025-05-05 11:43:17.640734','2025-05-05 11:43:17.640734');
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_client_backup`
--

DROP TABLE IF EXISTS `temp_client_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_client_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `installationDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `advancePayment` tinyint(4) DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `planId` int(11) DEFAULT NULL,
  `sectorId` int(11) DEFAULT NULL,
  `routerSerial` varchar(255) DEFAULT NULL,
  `decoSerial` varchar(255) DEFAULT NULL,
  `paymentStatus` enum('SUSPENDED','EXPIRING','EXPIRED','PAID') NOT NULL,
  `referenceImage` varchar(255) DEFAULT NULL,
  `initialPaymentDate` datetime DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_client_backup`
--

LOCK TABLES `temp_client_backup` WRITE;
/*!40000 ALTER TABLE `temp_client_backup` DISABLE KEYS */;
INSERT INTO `temp_client_backup` VALUES (1,'Mery Blanca','Chinchay Gomez','41663054','951376951','Carrtera Huantallon','2025-04-29 00:00:00','Antes de a plaza de armas','2025-05-29 00:00:00',1,'ACTIVE','Casa 3 pisos','2025-05-05 09:39:26.956751','2025-06-07 15:53:40.000000',2,2,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(2,'Yuli Julissa','Rímac López','75524515','987780017','Calle la soledad s/n','2025-05-04 05:00:00','antes capilla','2025-06-05 05:00:00',1,'SUSPENDED','','2025-05-05 11:59:42.113875','2025-07-08 18:57:43.000000',2,2,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(3,'Miguel Angel','Regaldo Palma','74357705','948954927','Carretera Huaraz - Caraz ','2025-05-03 05:00:00','Antes del puente de Mullaca','2025-07-03 00:00:00',1,'ACTIVE','','2025-05-05 14:50:45.821721','2025-07-08 18:57:43.000000',2,3,NULL,NULL,'EXPIRED',NULL,NULL,NULL),(4,'Eberth Gabriel','Minaya Garcia','44825378','943900818','Carreterea Huaraz - Caraz','2025-05-03 05:00:00','Pasando 2do Puente - Uchuyacu','2025-06-03 05:00:00',1,'SUSPENDED','FERRETERIA TECHO ROJO','2025-05-05 20:20:40.249991','2025-06-11 23:09:09.000000',2,4,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(5,'Grescia ','Evangelina Salvador','60858237','991438074','Carretera San Miguel','2025-04-29 00:00:00','Segunda Curva','2025-05-28 00:00:00',0,'SUSPENDED','','2025-05-05 20:26:42.541257','2025-06-11 23:09:09.000000',3,9,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(6,'Edinson ','Atoc Obregon','71926248','928028535','Jr. Miguel Grau ','2025-04-29 00:00:00','Una cuadra despues de la plaza','2025-05-28 00:00:00',1,'SUSPENDED','','2025-05-05 20:30:56.269864','2025-06-11 23:09:09.000000',3,10,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(7,'Lenin','Linares Leiva','75671429','938231126','Carretera Musho - Tumpa','2025-03-24 05:00:00','Frente a la Puerta Principal del Colegio Musho','2025-05-24 00:00:00',1,'SUSPENDED','','2025-05-08 22:47:28.559995','2025-06-11 23:09:09.000000',3,10,'223C9H6002801','-','SUSPENDED',NULL,NULL,NULL),(8,'Hiber Victor ','Alva Pachas','33342491','943499360','Av. Monterrey Nro. 4997','2025-01-09 05:00:00','Maderera rio santa','2025-02-09 05:00:00',0,'ACTIVE','','2025-05-09 14:17:06.679041','2025-05-09 14:17:06.679041',2,6,'48575443E82234AC','','SUSPENDED',NULL,NULL,NULL),(9,'Flor ','Maguiña Ayala','45889852','910670128','Carrterera Huaraz - Caraz ','2025-03-15 05:00:00','Mullaca','2025-05-15 00:00:00',0,'ACTIVE','','2025-05-09 14:26:40.545883','2025-05-23 17:36:49.000000',2,3,'','','SUSPENDED',NULL,NULL,NULL),(10,'Keyvin Justo','Minaya Picon','75261732','935224372','Primer entrada a Huantallon','2025-04-08 05:00:00','Casa Rustico','2025-07-07 00:00:00',0,'ACTIVE','','2025-05-09 14:32:25.642064','2025-07-08 18:57:43.000000',2,2,'','','EXPIRED',NULL,NULL,NULL),(11,'Alex Manuel ','Blas Colonia ','46262455','976732200','Carretera Huantallon','2025-04-22 00:00:00','Antes de Voltear a la Iglesia ','2025-06-21 00:00:00',1,'SUSPENDED','','2025-05-09 14:44:18.073177','2025-07-08 18:57:43.000000',2,2,'09B192AA','','SUSPENDED',NULL,NULL,NULL),(12,'Daniel Jesus ','Chavez Javier','44049492','978208097','Caserio Santa Rosa','2025-03-29 05:00:00','Primer Rompemuelle','2025-05-29 00:00:00',1,'SUSPENDED','','2025-05-09 14:55:28.852989','2025-06-11 23:09:09.000000',2,5,'','','SUSPENDED',NULL,NULL,NULL),(13,'Denis Patricia ','Cashpa Vega','47104542','924132661','Centro Poblado de Tumpa ','2025-03-09 12:00:00','Costado del Colegio de Tumpa','2025-06-07 12:00:00',0,'SUSPENDED','','2025-05-09 18:58:36.544478','2025-07-08 18:54:08.000000',1,10,'','','SUSPENDED',NULL,NULL,'192.65.123.0');
/*!40000 ALTER TABLE `temp_client_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_payment_backup`
--

DROP TABLE IF EXISTS `temp_payment_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_payment_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `paymentDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `reconnection` tinyint(4) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `state` enum('PENDING','PAYMENT_DAILY','LATE_PAYMENT','VOIDED') DEFAULT NULL,
  `paymentType` enum('TRANSFER','CASH','YAPE','PLIN','OTHER') DEFAULT NULL,
  `transfername` varchar(255) DEFAULT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `dueDate` datetime DEFAULT NULL,
  `created_At` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_At` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `clientId` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `baseAmount` decimal(10,2) NOT NULL,
  `reconnectionFee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `isVoided` tinyint(4) NOT NULL DEFAULT 0,
  `voidedAt` datetime DEFAULT NULL,
  `voidedReason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_payment_backup`
--

LOCK TABLES `temp_payment_backup` WRITE;
/*!40000 ALTER TABLE `temp_payment_backup` DISABLE KEYS */;
INSERT INTO `temp_payment_backup` VALUES (1,'2025-05-08 05:00:00','04181115',0,50.00,'LATE_PAYMENT','YAPE','Mily Hidalgo - 04181115',0.00,'2025-04-24 05:00:00','2025-05-08 22:50:11.348659','2025-06-11 23:13:19.000000',7,'PG-LL1429-0001',0.00,0.00,0,NULL,NULL),(2,'2025-05-09 05:00:00','04760728',0,50.00,'LATE_PAYMENT','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-04-15 05:00:00','2025-05-09 14:28:07.934871','2025-06-11 23:13:19.000000',9,'PG-FM9852-0001',0.00,0.00,0,NULL,NULL),(4,'2025-05-09 05:00:00','04240636',0,50.00,'PAYMENT_DAILY','TRANSFER','GRUPO HEMMY EIRL',0.00,'2025-05-21 05:00:00','2025-05-09 14:47:52.198525','2025-06-11 23:13:19.000000',11,'PG-AB2455-0001',0.00,0.00,0,NULL,NULL),(5,'2025-05-09 05:00:00','09640137',0,50.00,'PAYMENT_DAILY','YAPE','MILY HIDALGO ROJAS',0.00,'2025-06-07 05:00:00','2025-05-09 14:49:54.503539','2025-06-11 23:13:19.000000',10,'PG-KM1732-0001',0.00,0.00,0,NULL,NULL),(6,'2025-05-09 05:00:00','03792646',0,50.00,'LATE_PAYMENT','YAPE','MILY HIDALGO ROJAS',0.00,'2025-04-29 05:00:00','2025-05-09 14:57:00.484139','2025-06-11 23:13:19.000000',12,'PG-DC9492-0001',0.00,0.00,0,NULL,NULL),(7,'2025-05-09 05:00:00','01368592',0,80.00,'LATE_PAYMENT','TRANSFER','GRUPO HEMMY EIRL',0.00,'2025-05-08 05:00:00','2025-05-09 19:02:02.841352','2025-06-11 23:13:19.000000',13,'PG-DC4542-0001',0.00,0.00,0,NULL,NULL);
/*!40000 ALTER TABLE `temp_payment_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_payment_history_backup`
--

DROP TABLE IF EXISTS `temp_payment_history_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_payment_history_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paymentDate` datetime DEFAULT NULL,
  `dueDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `paymentType` varchar(255) DEFAULT NULL,
  `created_At` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `paymentId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_payment_history_backup`
--

LOCK TABLES `temp_payment_history_backup` WRITE;
/*!40000 ALTER TABLE `temp_payment_history_backup` DISABLE KEYS */;
/*!40000 ALTER TABLE `temp_payment_history_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `documentType` varchar(255) NOT NULL,
  `documentNumber` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  UNIQUE KEY `IDX_8e1f623798118e629b46a9e629` (`phone`),
  KEY `FK_c28e52f758e7bbc53828db92194` (`roleId`),
  CONSTRAINT `FK_c28e52f758e7bbc53828db92194` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'GRUPO','Hemmy','DNI','12345678','admin','grupohemmy@gmail.com','974834831','$2b$10$y2gyKjwLWvW2C7.PCYk4ju9VhHqQ/Ucq5zO2Zg2TVxfxFEtVxGOU6',1,'2025-05-05 08:08:56.851207','2025-05-08 18:27:59.000000',1),(2,'Admin','Hemmy','DNI','12345678','hemicha','admin@hemmy.com','999999999','$2b$10$AxUzbZyYinaWyO9ab08hruHedpMJaM5Co5r2f2CjmkhuccD4mRPQe',1,'2025-05-08 21:38:58.791361','2025-05-08 21:38:58.791361',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-08 17:06:32
