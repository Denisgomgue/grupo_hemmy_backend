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
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (1,'Mery Blanca','Chinchay Gomez','41663054','951376951','Carrtera Huantallon','2025-04-29 00:00:00','Antes de a plaza de armas','2025-05-29 00:00:00',1,'ACTIVE','Casa 3 pisos','2025-05-05 09:39:26.956751','2025-06-06 05:00:01.000000',2,2,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(2,'Yuli Julissa','Rímac López','75524515','987780017','Calle la soledad s/n','2025-05-04 05:00:00','antes capilla','2025-06-05 05:00:00',1,'SUSPENDED','','2025-05-05 11:59:42.113875','2025-06-13 05:00:03.000000',2,2,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(3,'Miguel Angel','Regaldo Palma','74357705','948954927','Carretera Huaraz - Caraz ','2025-05-03 05:00:00','Antes del puente de Mullaca','2025-07-03 00:00:00',1,'SUSPENDED','','2025-05-05 14:50:45.821721','2025-07-10 05:00:00.000000',2,3,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(4,'Eberth Gabriel','Minaya Garcia','44825378','943900818','Carreterea Huaraz - Caraz','2025-05-03 05:00:00','Pasando 2do Puente - Uchuyacu','2025-06-03 05:00:00',1,'SUSPENDED','FERRETERIA TECHO ROJO','2025-05-05 20:20:40.249991','2025-06-11 23:35:23.000000',2,4,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(5,'Grescia ','Evangelina Salvador','60858237','991438074','Carretera San Miguel','2025-04-29 00:00:00','Segunda Curva','2025-05-28 00:00:00',0,'ACTIVE','','2025-05-05 20:26:42.541257','2025-06-05 05:00:00.000000',3,9,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(6,'Edinson ','Atoc Obregon','71926248','928028535','Jr. Miguel Grau ','2025-04-29 00:00:00','Una cuadra despues de la plaza','2025-05-28 00:00:00',1,'ACTIVE','','2025-05-05 20:30:56.269864','2025-06-05 05:00:01.000000',3,10,NULL,NULL,'SUSPENDED',NULL,NULL,NULL),(7,'Lenin','Linares Leiva','75671429','938231126','Carretera Musho - Tumpa','2025-03-24 05:00:00','Frente a la Puerta Principal del Colegio Musho','2025-05-24 00:00:00',1,'ACTIVE','','2025-05-08 22:47:28.559995','2025-06-01 05:00:00.000000',3,10,'223C9H6002801','-','SUSPENDED',NULL,NULL,NULL),(8,'Hiber Victor ','Alva Pachas','33342491','943499360','Av. Monterrey Nro. 4997','2025-01-09 05:00:00','Maderera rio santa','2025-04-09 12:00:00',0,'ACTIVE','','2025-05-09 14:17:06.679041','2025-05-24 05:00:00.000000',2,6,'48575443E82234AC','','SUSPENDED',NULL,NULL,NULL),(9,'Flor ','Maguiña Ayala','45889852','910670128','Carrterera Huaraz - Caraz ','2025-03-15 05:00:00','Mullaca','2025-05-15 00:00:00',0,'ACTIVE','','2025-05-09 14:26:40.545883','2025-05-23 17:36:49.000000',2,3,'','','SUSPENDED',NULL,NULL,NULL),(10,'Keyvin Justo','Minaya Picon','75261732','935224372','Primer entrada a Huantallon','2025-04-08 05:00:00','Casa Rustico','2025-07-07 00:00:00',0,'SUSPENDED','','2025-05-09 14:32:25.642064','2025-07-14 05:00:00.000000',2,2,'','','SUSPENDED',NULL,NULL,NULL),(11,'Alex Manuel ','Blas Colonia ','46262455','976732200','Carretera Huantallon','2025-04-22 00:00:00','Antes de Voltear a la Iglesia ','2025-06-21 00:00:00',1,'SUSPENDED','','2025-05-09 14:44:18.073177','2025-06-28 05:00:01.000000',2,2,'09B192AA','','SUSPENDED',NULL,NULL,NULL),(12,'Daniel Jesus ','Chavez Javier','44049492','978208097','Caserio Santa Rosa','2025-03-29 05:00:00','Primer Rompemuelle','2025-05-29 00:00:00',1,'ACTIVE','','2025-05-09 14:55:28.852989','2025-06-06 05:00:01.000000',2,5,'','','SUSPENDED',NULL,NULL,NULL),(13,'Denis Patricia ','Cashpa Vega','47104542','924132661','Centro Poblado de Tumpa ','2025-03-10 00:00:00','Costado del Colegio de Tumpa','2025-06-08 00:00:00',0,'SUSPENDED','','2025-05-09 18:58:36.544478','2025-06-15 05:00:00.000000',1,10,'','','SUSPENDED',NULL,NULL,NULL),(14,'Cindy Thalia ','Herreros Macedo','76503551','928199501','Paraje Mullaca S/N','2025-04-16 12:00:00','Antes de peaje','2025-06-16 12:00:00',0,'SUSPENDED','Se Instalo el 16 de enero 2025','2025-05-23 19:03:51.245948','2025-06-24 05:00:00.000000',3,3,'','','SUSPENDED',NULL,NULL,NULL),(15,'Juan David','Mercedes Aparicio','46371195','943874407','Paraje Mullaca','2025-04-01 12:00:00','antes del peaje','2025-07-01 12:00:00',0,'SUSPENDED','El usuario pertenece del año 2022','2025-05-23 19:16:35.178053','2025-07-09 05:00:01.000000',3,3,'','','SUSPENDED',NULL,NULL,NULL),(16,'Mercedes ','Cano Perez','31672898','945975630','Jr. Juan Brioso 640  ','2025-04-19 12:00:00','','2025-06-19 12:00:00',0,'SUSPENDED','Espalda de grifo monterrey','2025-05-23 21:20:27.320154','2025-06-27 05:00:00.000000',2,6,'','','SUSPENDED',NULL,NULL,NULL),(17,'COSTODIO CIRILO','CANARES AQUINO','80193446','922478175','Carretera Huaraz - Caraz ','2025-04-20 12:00:00','antes de mullaca','2025-06-20 12:00:00',0,'SUSPENDED','','2025-05-24 00:47:32.810526','2025-06-28 05:00:01.000000',2,3,'','','SUSPENDED',NULL,NULL,NULL),(18,'Bertha','Martinez Gonzales ','72377113','992032834','Pasje Porvenir s/n','2025-05-29 12:00:00','altura cocacola','2025-07-29 12:00:00',1,'SUSPENDED','Empresa Artika','2025-05-30 14:55:09.519462','2025-08-06 05:00:00.000000',2,6,'485754434C4233AF','','SUSPENDED',NULL,NULL,NULL),(19,'Daniela ','Mescua Leon','77157039','935595338','Jr. Juan Brioso','2025-05-29 12:00:00','','2025-07-29 12:00:00',1,'SUSPENDED','Espalda de Backus','2025-05-30 14:58:50.379410','2025-08-06 05:00:00.000000',2,6,'48576443CDB60DA5','','SUSPENDED',NULL,NULL,NULL),(20,'Yury Wilve ','Morales Peña','76660293','948445514','Carretera Huaraz - Caraz - Uchuyacu','2025-04-29 12:00:00','Pasando Puente','2025-07-29 12:00:00',1,'SUSPENDED','','2025-05-30 17:17:03.051930','2025-08-06 05:00:00.000000',2,4,'','','SUSPENDED',NULL,NULL,NULL),(21,'Homero Olonche','Lopez Cuadra','40441551','988572300','Carretera Uchuyacu km11','2025-02-24 12:00:00','Antes de cruce Tara','2025-03-24 12:00:00',0,'ACTIVE','','2025-05-30 17:25:11.087003','2025-05-31 05:00:01.000000',4,4,'','','SUSPENDED',NULL,NULL,NULL),(22,'Oscar Fernando ','Atusparia Jamanca','70839227','931079987','Av. Cordillera Blanca S/N','2025-05-30 12:00:00','Pasando Backus','2025-07-30 12:00:00',1,'SUSPENDED','','2025-05-31 01:06:22.358816','2025-08-07 05:00:01.000000',2,6,'48575443624EC9AF','22081M4011242','SUSPENDED',NULL,NULL,NULL),(23,'Lucy Carmen','Osorio Lazaro','44272568','942875523','Carretera Mullaca ','2025-04-29 12:00:00','Pasando el letrero de mullaca','2025-07-29 12:00:00',0,'SUSPENDED','','2025-06-02 14:52:38.861337','2025-08-06 05:00:00.000000',4,3,'','','SUSPENDED',NULL,NULL,NULL),(24,'Pilar Elena','Jamez Lopez','31628697','943486314','av. centenario','2025-06-03 12:00:00','Restaurante cortijo','2025-07-03 12:00:00',1,'SUSPENDED','','2025-06-03 23:05:32.268257','2025-07-11 05:00:00.000000',2,6,'48575443DD0DF7A6','','SUSPENDED',NULL,NULL,NULL),(25,'Yovana ','Rosales Rosas','75261616','961843359','Caserio de Carianpampa','2025-05-01 12:00:00','Antes de la Plaza','2025-08-02 12:00:00',0,'ACTIVE','','2025-06-04 02:58:31.123340','2025-08-03 05:00:01.000000',5,8,'','','EXPIRED',NULL,NULL,NULL),(26,'Diosin Siani ','Bacilio Rosas','75407696','916362221','Carretera Huaraz - Santa Rosa','2025-05-03 12:00:00','Paradero Santa Rosa','2025-07-03 12:00:00',1,'SUSPENDED','','2025-06-04 03:04:37.401572','2025-07-11 05:00:00.000000',2,5,'','','SUSPENDED',NULL,NULL,NULL),(27,'Teodoro','Javier Yauri','31608307','943601446','Av. Centenario Nro. 5153','2025-04-03 12:00:00','Frente a la Clinica','2025-06-03 12:00:00',0,'SUSPENDED','','2025-06-04 03:10:15.436552','2025-06-11 23:35:23.000000',4,6,'','','SUSPENDED',NULL,NULL,NULL),(28,'Jerufe Said','Barandiaran Prince','44214748','987894300','Jr. Juan Brioso','2025-04-16 12:00:00','Lado de Caja 2','2025-07-16 12:00:00',1,'SUSPENDED','','2025-06-04 03:17:37.896142','2025-07-24 05:00:00.000000',2,6,'','','SUSPENDED',NULL,NULL,NULL),(29,'Libia Viviana ','Palma Rosas','31682147','961274788','Carretera Huaraz - Mullaca ','2025-05-01 12:00:00','Pasando Letrero Mullaca','2025-07-02 12:00:00',0,'SUSPENDED','','2025-06-04 03:22:28.035898','2025-07-10 05:00:00.000000',6,3,'','','SUSPENDED',NULL,NULL,NULL),(30,'Hibeth','Canon Salvador','42759363','965289763','Santa Rosa','2025-06-20 12:00:00','subes el segundo pasaje pasando los eucaliptos el segundo puente','2025-07-20 12:00:00',0,'SUSPENDED','','2025-06-20 18:03:59.599737','2025-07-28 05:00:01.000000',2,5,'48575443650528AE','','SUSPENDED','uploads/clients/a78e4100.jpg','2025-07-20 12:00:00','192.168.10.135'),(31,'Oscar Wilfredo','Sudario Vargas','60876048','901146444','San Miguel','2025-06-18 12:00:00','Al lado de la Bodega Lourdes','2025-07-18 12:00:00',1,'SUSPENDED','Se dejo una repetidora ','2025-06-20 18:15:38.499210','2025-07-26 05:00:03.000000',2,9,'485754432D80B2AC','','SUSPENDED','uploads/clients/8dd46ff9.jpg','2025-07-18 12:00:00','192.168.10.133'),(32,'Jose Manuel','Reyes Caqui','72559787','934904723','Chontayoc','2025-06-19 12:00:00','Pasando la plazuela','2025-07-19 12:00:00',0,'SUSPENDED','','2025-06-20 18:22:00.929346','2025-07-27 05:00:00.000000',2,11,'485754432EB18DAC','','SUSPENDED',NULL,'2025-07-19 12:00:00','192.168.10.136'),(33,'Raimundo ','Lazaro Camilo','31648752','929469467','Mullaca Puente Italia','2025-06-16 12:00:00','pasando el puente mullaca a unos 220 metros de la caja(puente Italia)','2025-07-16 12:00:00',1,'SUSPENDED','','2025-06-20 18:29:49.535657','2025-07-24 05:00:00.000000',2,3,'4857544303E1E3A8','','SUSPENDED','uploads/clients/c488dfa6.jpg','2025-07-16 12:00:00','192.168.10.134'),(34,'Adriana Brigitt','Vergara Huaman','76361281','910231469','Mullaca','2025-06-05 12:00:00','Pasando el puente mulla a unos 10 mts de la caja casa roja','2025-07-05 12:00:00',0,'SUSPENDED','Se deja 1 Repetidora','2025-06-20 18:42:58.595893','2025-07-13 05:00:01.000000',2,3,'485754436B58CCA5','','SUSPENDED','uploads/clients/bfea4b2d.jpg','2025-07-05 12:00:00','192.168.10.128'),(35,'Alexander Steve','Carbajal Jaimes','75018641','944405004','Uchuyacu','2025-06-09 12:00:00','pasando el segundo puente antes de la ferreteria','2025-07-09 12:00:00',1,'SUSPENDED','','2025-06-20 18:59:46.895121','2025-07-17 05:00:00.000000',2,5,'4857544319658DAA','','SUSPENDED','uploads/clients/9e67d72e.jpg','2025-07-09 12:00:00','192.168.10.130'),(36,'Lourdes ','Vega Romero','40848852','995356621','San Miguel','2025-06-07 12:00:00','Bodega Lourdes','2025-07-07 12:00:00',1,'SUSPENDED','','2025-06-20 19:03:36.216143','2025-07-15 05:00:00.000000',2,9,'485754435D908BAF','','SUSPENDED','uploads/clients/f6fc2ae2.jpg','2025-07-07 12:00:00','192.168.10.126'),(37,'Estela ','Diaz Sanchez','31602713','943286204','Monterrey','2025-06-05 12:00:00','en el cruce al frente de la clinica','2025-07-05 12:00:00',1,'SUSPENDED','','2025-06-20 19:15:48.121349','2025-07-13 05:00:01.000000',2,6,'485754435D9B7FAF','','SUSPENDED','uploads/clients/ffa1556b.jpg','2025-07-05 12:00:00','192.168.10.124'),(38,'Maria Deudata','Giraldo D Caushi','31647750','953044079','Santa Rosa ','2025-06-20 12:00:00','Subir la calle pasando el puente santa rosa','2025-07-20 12:00:00',0,'SUSPENDED','','2025-06-20 23:47:09.050946','2025-07-28 05:00:01.000000',2,5,'485754439D58CAAA','','SUSPENDED','uploads/clients/1f3faa5f.jpg','2025-07-20 12:00:00','192.168.10.132'),(39,'Mary Astrid','Melgarejo Gonzales','44049055','920122946','Centro Poblado de Quichirragra','2025-06-16 12:00:00','al frente del parque de Quichirragra','2025-07-16 12:00:00',0,'SUSPENDED','','2025-06-26 20:15:44.186268','2025-07-24 05:00:00.000000',5,12,'22446B6005105','','SUSPENDED','uploads/clients/d3047daa.jpg','2025-07-16 12:00:00','192.168.80.234'),(40,'Lee Nelson ','Figueroa Cordova','47164513','959659788','Jr. Juan Briosso 106 - Monterrey','2025-07-31 12:00:00','Hostal Nogal','2025-08-31 12:00:00',1,'ACTIVE','','2025-08-01 14:31:28.744845','2025-08-01 14:42:03.000000',4,6,'485754435B920BAF','','PAID','uploads/clients/3c0ed6b1.jpg','2025-08-31 12:00:00','192.168.10.145'),(41,'Joel ','Álvaron Duran','31657998','938154747','Monterrey','2025-07-28 12:00:00','Antes del puente  última casa  material noble de 2 pisos','2025-08-28 12:00:00',0,'ACTIVE','','2025-08-01 14:41:10.264850','2025-08-01 14:41:10.264850',2,6,'485754437866B7B3','','PAID','uploads/clients/58f420a6.jpg','2025-08-28 12:00:00','192.168.10.144'),(42,'Franz ','Figueroa Macedo ','76414842','995974633','Chontayoc','2025-07-26 12:00:00','Antes del transformador de  chontayoc ','2025-08-26 12:00:00',1,'ACTIVE','','2025-08-01 15:05:35.884450','2025-08-01 15:05:50.000000',2,11,'V24042504110','','PAID','uploads/clients/d7710c1f.jpg','2025-08-26 12:00:00','192.168.10.143'),(43,'Jovel Bautista ','Garcia Mendoza ','60123325','985986093','Chontayoc','2025-07-26 12:00:00','Antes de la escuela de chontayoc ','2025-08-26 12:00:00',1,'ACTIVE','','2025-08-01 15:10:48.689206','2025-08-01 15:10:58.000000',2,11,'48575443FD410EA3','','PAID','uploads/clients/16176c7f.jpg','2025-08-26 12:00:00','192.168.10.142');
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
  `initialPaymentDate` datetime DEFAULT NULL,
  `installationId` int(11) DEFAULT NULL,
  `advancePayment` tinyint(4) NOT NULL DEFAULT 0,
  `paymentStatus` enum('SUSPENDED','EXPIRED','EXPIRING','PAID') NOT NULL DEFAULT 'PAID',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_12d019b1506840925f05b55292` (`installationId`),
  CONSTRAINT `FK_12d019b1506840925f05b552925` FOREIGN KEY (`installationId`) REFERENCES `installations` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
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
  `name` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `dni` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `birthdate` datetime DEFAULT NULL,
  `status` enum('ACTIVE','SUSPENDED','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8e645da308339e84f45d6cfe5d` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `businessName` varchar(255) NOT NULL,
  `ruc` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `logoNormal` varchar(255) DEFAULT NULL,
  `logoHorizontal` varchar(255) DEFAULT NULL,
  `logoReduced` varchar(255) DEFAULT NULL,
  `logoNegative` varchar(255) DEFAULT NULL,
  `slogan` varchar(255) DEFAULT NULL,
  `mission` varchar(255) DEFAULT NULL,
  `vision` varchar(255) DEFAULT NULL,
  `socialMedia` varchar(255) DEFAULT NULL,
  `businessHours` varchar(255) DEFAULT NULL,
  `taxCategory` varchar(255) DEFAULT NULL,
  `economicActivity` varchar(255) DEFAULT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1fe1a1fe5eaf15ada69b1b2e99` (`ruc`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Grupo Hemmy','Grupo Hemmy','20610631143','AV. CORDILLERA BLANCA NRO. 325 BAR. MONTERREY','Huaraz','Huaraz','Independencia','Perú','+51945447970','-','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-08-16 23:51:58.057786','2025-08-16 23:51:58.057786');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serialNumber` varchar(255) DEFAULT NULL,
  `macAddress` varchar(255) DEFAULT NULL,
  `type` enum('router','deco','ont','switch','laptop','crimpadora','tester','antena','fibra','conector','otro') NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `status` enum('STOCK','ASSIGNED','SOLD','MAINTENANCE','LOST','USED') NOT NULL,
  `assignedDate` date DEFAULT NULL,
  `useType` enum('CLIENT','EMPLOYEE','COMPANY','CONSUMABLE') NOT NULL,
  `assignedInstallationId` int(11) DEFAULT NULL,
  `assignedEmployeeId` int(11) DEFAULT NULL,
  `assignedClientId` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_b6aa99e9dfa5943902dc85277db` (`assignedInstallationId`),
  KEY `FK_e5a3f0bc1825b1ec9d71f3f3e22` (`assignedEmployeeId`),
  KEY `FK_f7816a3a026c93ed64795deb4e1` (`assignedClientId`),
  CONSTRAINT `FK_b6aa99e9dfa5943902dc85277db` FOREIGN KEY (`assignedInstallationId`) REFERENCES `installations` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_e5a3f0bc1825b1ec9d71f3f3e22` FOREIGN KEY (`assignedEmployeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_f7816a3a026c93ed64795deb4e1` FOREIGN KEY (`assignedClientId`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
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
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_6196007a1366caac15a821a6f3` (`dni`),
  KEY `FK_24d98872eb52c3edb30ce96c1e9` (`roleId`),
  CONSTRAINT `FK_24d98872eb52c3edb30ce96c1e9` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
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
  `installationDate` datetime DEFAULT NULL,
  `reference` text DEFAULT NULL,
  `ipAddress` varchar(255) DEFAULT NULL,
  `referenceImage` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `clientId` int(11) NOT NULL,
  `planId` int(11) NOT NULL,
  `sectorId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9a5d930ad9e41129cfd82b2b9b2` (`clientId`),
  KEY `FK_85e461c66cfd7111f7c4aa65100` (`planId`),
  KEY `FK_f944325409bf04d5daf2e9d1d11` (`sectorId`),
  CONSTRAINT `FK_85e461c66cfd7111f7c4aa65100` FOREIGN KEY (`planId`) REFERENCES `plans` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_9a5d930ad9e41129cfd82b2b9b2` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_f944325409bf04d5daf2e9d1d11` FOREIGN KEY (`sectorId`) REFERENCES `sectors` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `installations`
--

LOCK TABLES `installations` WRITE;
/*!40000 ALTER TABLE `installations` DISABLE KEYS */;
/*!40000 ALTER TABLE `installations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('CLIENT_SUSPENDED','CLIENT_ACTIVATED','PAYMENT_DUE_SOON','PAYMENT_OVERDUE','PAYMENT_RECEIVED','CLIENT_DEACTIVATED','SYSTEM_ALERT') NOT NULL,
  `status` enum('UNREAD','READ') NOT NULL DEFAULT 'UNREAD',
  `title` varchar(255) NOT NULL,
  `message` varchar(255) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `clientId` int(11) DEFAULT NULL,
  `paymentId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_692a909ee0fa9383e7859f9b406` (`userId`),
  CONSTRAINT `FK_692a909ee0fa9383e7859f9b406` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,'2025-05-08 05:00:00','04181115',0,50.00,'LATE_PAYMENT','YAPE','Mily Hidalgo - 04181115',0.00,'2025-04-24 05:00:00','2025-05-08 22:50:11.348659','2025-06-11 23:36:00.000000',7,'PG-LL1429-0001',0.00,0.00,0,NULL,NULL),(2,'2025-05-09 05:00:00','04760728',0,50.00,'LATE_PAYMENT','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-04-15 05:00:00','2025-05-09 14:28:07.934871','2025-06-11 23:36:00.000000',9,'PG-FM9852-0001',0.00,0.00,0,NULL,NULL),(4,'2025-05-09 05:00:00','04240636',0,50.00,'PAYMENT_DAILY','TRANSFER','GRUPO HEMMY EIRL',0.00,'2025-05-21 05:00:00','2025-05-09 14:47:52.198525','2025-06-11 23:36:01.000000',11,'PG-AB2455-0001',0.00,0.00,0,NULL,NULL),(5,'2025-05-09 05:00:00','09640137',0,50.00,'PAYMENT_DAILY','YAPE','MILY HIDALGO ROJAS',0.00,'2025-06-07 05:00:00','2025-05-09 14:49:54.503539','2025-06-11 23:36:00.000000',10,'PG-KM1732-0001',0.00,0.00,0,NULL,NULL),(6,'2025-05-09 05:00:00','03792646',0,50.00,'LATE_PAYMENT','YAPE','MILY HIDALGO ROJAS',0.00,'2025-04-29 05:00:00','2025-05-09 14:57:00.484139','2025-06-11 23:36:01.000000',12,'PG-DC9492-0001',0.00,0.00,0,NULL,NULL),(7,'2025-05-09 05:00:00','01368592',0,80.00,'LATE_PAYMENT','TRANSFER','GRUPO HEMMY EIRL',0.00,'2025-05-08 05:00:00','2025-05-09 19:02:02.841352','2025-06-11 23:36:01.000000',13,'PG-DC4542-0001',0.00,0.00,0,NULL,NULL),(9,'2025-05-22 12:00:00','231895',0,50.00,'LATE_PAYMENT','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-05-16 05:00:00','2025-05-23 19:06:03.498278','2025-06-11 23:36:01.000000',14,'PG-CH3551-0001',0.00,0.00,0,NULL,NULL),(10,'2025-05-01 12:00:00','Scotiabank',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-05-01 05:00:00','2025-05-23 19:18:48.389552','2025-06-11 23:36:01.000000',15,'PG-JM1195-0001',0.00,0.00,0,NULL,NULL),(11,'2025-05-15 12:00:00','06026622',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-05-19 05:00:00','2025-05-23 21:21:28.140460','2025-06-11 23:36:01.000000',16,'PG-MC2898-0001',0.00,0.00,0,NULL,NULL),(12,'2025-05-12 12:00:00','02639484',0,50.00,'PAYMENT_DAILY','YAPE','Mily Hidalgo Rojas',0.00,'2025-03-09 05:00:00','2025-05-24 00:41:56.599534','2025-06-11 23:36:00.000000',8,'PG-HA2491-0001',0.00,0.00,0,NULL,NULL),(13,'2025-05-23 12:00:00','053735',0,50.00,'LATE_PAYMENT','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-05-20 05:00:00','2025-05-24 00:48:53.012400','2025-06-11 23:36:01.000000',17,'PG-CC3446-0001',0.00,0.00,0,NULL,NULL),(14,'2025-05-29 12:00:00','16212497',0,50.00,'PAYMENT_DAILY','YAPE','MILY HIDALGO ROJAS',0.00,'2025-06-29 05:00:00','2025-05-30 14:56:05.503425','2025-06-11 23:36:01.000000',18,'PG-BM7113-0001',0.00,0.00,0,NULL,NULL),(15,'2025-05-29 12:00:00','Mily Hidalgo',0,50.00,'PAYMENT_DAILY','CASH','',0.00,'2025-06-29 05:00:00','2025-05-30 14:59:27.544742','2025-06-11 23:36:01.000000',19,'PG-DM7039-0001',0.00,0.00,0,NULL,NULL),(16,'2025-05-30 12:00:00','01532916',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-06-29 05:00:00','2025-05-30 17:18:07.460373','2025-06-11 23:36:01.000000',20,'PG-YM0293-0001',0.00,0.00,0,NULL,NULL),(17,'2025-05-30 12:00:00','03594446',0,50.00,'PAYMENT_DAILY','YAPE','Mily Hidalgo Rojas',0.00,'2025-06-30 05:00:00','2025-05-31 01:07:28.821812','2025-06-11 23:36:01.000000',22,'PG-OA9227-0001',0.00,0.00,0,NULL,NULL),(18,'2025-05-30 12:00:00','001880',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-06-29 05:00:00','2025-06-02 14:54:22.573168','2025-06-11 23:36:01.000000',23,'PG-LO2568-0001',0.00,0.00,0,NULL,NULL),(19,'2025-06-02 12:00:00','191273',0,70.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-07-02 05:00:00','2025-06-04 02:59:46.810944','2025-06-11 23:36:01.000000',25,'PG-YR1616-0001',0.00,0.00,0,NULL,NULL),(20,'2025-06-03 12:00:00','04020968',0,50.00,'PAYMENT_DAILY','YAPE','Mily Hidalgo Rojas',0.00,'2025-06-03 05:00:00','2025-06-04 03:05:54.477320','2025-06-11 23:36:02.000000',26,'PG-DB7696-0001',0.00,0.00,0,NULL,NULL),(21,'2025-05-03 12:00:00','002945',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-05-03 05:00:00','2025-06-04 03:11:40.707575','2025-06-11 23:36:02.000000',27,'PG-TJ8307-0001',0.00,0.00,0,NULL,NULL),(22,'2025-06-02 12:00:00','Scotiabank',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-05-31 05:00:00','2025-06-04 03:13:40.237477','2025-06-11 23:36:01.000000',15,'PG-JM1195-0002',0.00,0.00,0,NULL,NULL),(23,'2025-05-06 12:00:00','Scotiabank',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-05-16 05:00:00','2025-06-04 03:18:11.754994','2025-06-11 23:36:02.000000',28,'PG-JB4748-0001',0.00,0.00,0,NULL,NULL),(24,'2025-06-02 12:00:00','Scotiabank',0,50.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-06-16 05:00:00','2025-06-04 03:18:50.257026','2025-06-11 23:36:02.000000',28,'PG-JB4748-0002',0.00,0.00,0,NULL,NULL),(25,'2025-06-02 12:00:00','057551',0,80.00,'PAYMENT_DAILY','TRANSFER','Grupo Hemmy EIRL',0.00,'2025-06-01 05:00:00','2025-06-04 03:25:04.701333','2025-06-11 23:36:02.000000',29,'PG-LP2147-0001',0.00,0.00,0,NULL,NULL);
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
  `reference` varchar(255) DEFAULT NULL,
  `type` enum('PAYMENT','VOID','ADJUSTMENT') DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `dueDate` date DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `engagementDate` date DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `paymentId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_93d739910b5eedf4e4c8ebd0ef4` (`paymentId`),
  KEY `FK_e5894e330e53bef06cf0f0dcf7f` (`clientId`),
  KEY `FK_94e025af3a36003b0a581930aed` (`userId`),
  CONSTRAINT `FK_93d739910b5eedf4e4c8ebd0ef4` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_94e025af3a36003b0a581930aed` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `FK_e5894e330e53bef06cf0f0dcf7f` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
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
  CONSTRAINT `FK_34d643de1a588d2350297da5c24` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_a3219994ab452282c74ef6de2ca` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_ab67a904aa1c9a7d606feadfa94` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_history`
--

LOCK TABLES `payment_history` WRITE;
/*!40000 ALTER TABLE `payment_history` DISABLE KEYS */;
INSERT INTO `payment_history` VALUES (3,50.00,0.00,'2025-05-22 12:00:00','2025-05-16 05:00:00','231895','TRANSFER','2025-05-23 19:06:03.669372',9,14,NULL),(4,50.00,0.00,'2025-05-01 12:00:00','2025-05-01 05:00:00','Scotiabank','TRANSFER','2025-05-23 19:18:48.547915',10,15,NULL),(5,50.00,0.00,'2025-05-15 12:00:00','2025-05-19 05:00:00','06026622','TRANSFER','2025-05-23 21:21:28.319487',11,16,NULL),(6,50.00,0.00,'2025-05-12 12:00:00','2025-02-09 05:00:00','02639484','YAPE','2025-05-24 00:41:56.955714',12,8,NULL),(7,50.00,0.00,'2025-05-23 12:00:00','2025-05-20 05:00:00','053735','TRANSFER','2025-05-24 00:48:53.237040',13,17,NULL),(8,50.00,0.00,'2025-05-12 12:00:00','2025-03-09 05:00:00','02639484','YAPE','2025-05-24 00:49:14.831652',12,8,NULL),(9,50.00,0.00,'2025-05-29 12:00:00','2025-06-29 05:00:00','16212497','YAPE','2025-05-30 14:56:05.844415',14,18,NULL),(10,50.00,0.00,'2025-05-29 12:00:00','2025-06-29 05:00:00','Mily Hidalgo','CASH','2025-05-30 14:59:27.774934',15,19,NULL),(11,50.00,0.00,'2025-05-30 12:00:00','2025-05-29 05:00:00','01532916','TRANSFER','2025-05-30 17:18:07.751103',16,20,NULL),(12,50.00,0.00,'2025-05-30 12:00:00','2025-06-29 05:00:00','01532916','TRANSFER','2025-05-30 17:18:29.258267',16,20,NULL),(13,50.00,0.00,'2025-05-30 12:00:00','2025-06-30 05:00:00','03594446','YAPE','2025-05-31 01:07:29.034181',17,22,NULL),(14,50.00,0.00,'2025-05-30 12:00:00','2025-05-29 05:00:00','001880','TRANSFER','2025-06-02 14:54:22.878420',18,23,NULL),(15,50.00,0.00,'2025-05-30 12:00:00','2025-06-29 05:00:00','001880','TRANSFER','2025-06-02 14:54:37.821659',18,23,NULL),(16,70.00,0.00,'2025-06-02 12:00:00','2025-06-01 05:00:00','191273','TRANSFER','2025-06-04 02:59:47.327011',19,25,NULL),(17,70.00,0.00,'2025-06-02 12:00:00','2025-07-02 05:00:00','191273','TRANSFER','2025-06-04 02:59:58.936909',19,25,NULL),(18,50.00,0.00,'2025-06-03 12:00:00','2025-06-03 05:00:00','04020968','YAPE','2025-06-04 03:05:54.631315',20,26,NULL),(19,50.00,0.00,'2025-05-03 12:00:00','2025-05-03 05:00:00','002945','TRANSFER','2025-06-04 03:11:40.968081',21,27,NULL),(20,50.00,0.00,'2025-06-02 12:00:00','2025-05-31 05:00:00','Scotiabank','TRANSFER','2025-06-04 03:13:40.448261',22,15,NULL),(21,50.00,0.00,'2025-06-02 12:00:00','2025-05-31 05:00:00','Scotiabank','TRANSFER','2025-06-04 03:13:55.689948',22,15,NULL),(22,50.00,0.00,'2025-05-06 12:00:00','2025-05-16 05:00:00','Scotiabank','TRANSFER','2025-06-04 03:18:12.013602',23,28,NULL),(23,50.00,0.00,'2025-06-02 12:00:00','2025-05-16 05:00:00','Scotiabank','TRANSFER','2025-06-04 03:18:50.359691',24,28,NULL),(24,50.00,0.00,'2025-06-02 12:00:00','2025-06-16 05:00:00','Scotiabank','TRANSFER','2025-06-04 03:19:02.724070',24,28,NULL),(25,80.00,0.00,'2025-06-02 12:00:00','2025-06-01 05:00:00','057551','TRANSFER','2025-06-04 03:25:04.818436',25,29,NULL),(26,80.00,0.00,'2025-06-02 12:00:00','2025-06-01 05:00:00','057551','TRANSFER','2025-06-04 03:25:15.352783',25,29,NULL);
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
  `code` varchar(255) DEFAULT NULL,
  `paymentDate` datetime DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `reconnection` tinyint(4) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `baseAmount` decimal(10,2) NOT NULL,
  `reconnectionFee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('PENDING','PAYMENT_DAILY','LATE_PAYMENT','VOIDED') DEFAULT NULL,
  `paymentType` enum('TRANSFER','CASH','YAPE','PLIN','OTHER') DEFAULT NULL,
  `transfername` varchar(255) DEFAULT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `dueDate` datetime DEFAULT NULL,
  `isVoided` tinyint(4) NOT NULL DEFAULT 0,
  `voidedAt` datetime DEFAULT NULL,
  `voidedReason` varchar(255) DEFAULT NULL,
  `engagementDate` datetime DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `clientId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_e7c2e95ccd4bd2068c70744dd65` (`clientId`),
  CONSTRAINT `FK_e7c2e95ccd4bd2068c70744dd65` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
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
  `displayName` varchar(255) DEFAULT NULL,
  `resourceId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ae8dcf78abc81b7eff867875560` (`resourceId`),
  CONSTRAINT `FK_ae8dcf78abc81b7eff867875560` FOREIGN KEY (`resourceId`) REFERENCES `resources` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'Crear Pago','payments','create','',0,'2025-08-16 23:51:58.142326','2025-08-16 23:51:58.142326','Pagos',3),(2,'Ver Pagos','payments','read','',0,'2025-08-16 23:51:58.147233','2025-08-16 23:51:58.147233','Pagos',3),(3,'Modificar Pago','payments','update','',0,'2025-08-16 23:51:58.156801','2025-08-16 23:51:58.156801','Pagos',3),(4,'Eliminar Pago','payments','delete','',0,'2025-08-16 23:51:58.161040','2025-08-16 23:51:58.161040','Pagos',3),(5,'Crear Cliente','clients','create','',0,'2025-08-16 23:51:58.166481','2025-08-16 23:51:58.166481','Clientes',2),(6,'Ver Clientes','clients','read','',0,'2025-08-16 23:51:58.170975','2025-08-16 23:51:58.170975','Clientes',2),(7,'Modificar Cliente','clients','update','',0,'2025-08-16 23:51:58.175295','2025-08-16 23:51:58.175295','Clientes',2),(8,'Eliminar Cliente','clients','delete','',0,'2025-08-16 23:51:58.179120','2025-08-16 23:51:58.179120','Clientes',2),(9,'Crear Instalación','installations','create','',0,'2025-08-16 23:51:58.183854','2025-08-16 23:51:58.183854','Instalaciones',4),(10,'Ver Instalaciones','installations','read','',0,'2025-08-16 23:51:58.188098','2025-08-16 23:51:58.188098','Instalaciones',4),(11,'Modificar Instalación','installations','update','',0,'2025-08-16 23:51:58.192253','2025-08-16 23:51:58.192253','Instalaciones',4),(12,'Eliminar Instalación','installations','delete','',0,'2025-08-16 23:51:58.196278','2025-08-16 23:51:58.196278','Instalaciones',4),(13,'Crear Empleado','employees','create','',0,'2025-08-16 23:51:58.201079','2025-08-16 23:51:58.201079','Empleados',6),(14,'Ver Empleados','employees','read','',0,'2025-08-16 23:51:58.205501','2025-08-16 23:51:58.205501','Empleados',6),(15,'Modificar Empleado','employees','update','',0,'2025-08-16 23:51:58.209582','2025-08-16 23:51:58.209582','Empleados',6),(16,'Eliminar Empleado','employees','delete','',0,'2025-08-16 23:51:58.214072','2025-08-16 23:51:58.214072','Empleados',6),(17,'Crear Dispositivo','devices','create','',0,'2025-08-16 23:51:58.221318','2025-08-16 23:51:58.221318','Dispositivos',5),(18,'Ver Dispositivos','devices','read','',0,'2025-08-16 23:51:58.227554','2025-08-16 23:51:58.227554','Dispositivos',5),(19,'Modificar Dispositivo','devices','update','',0,'2025-08-16 23:51:58.235617','2025-08-16 23:51:58.235617','Dispositivos',5),(20,'Eliminar Dispositivo','devices','delete','',0,'2025-08-16 23:51:58.243385','2025-08-16 23:51:58.243385','Dispositivos',5),(21,'Crear Plan','plans','create','',0,'2025-08-16 23:51:58.248513','2025-08-16 23:51:58.248513','Planes',13),(22,'Ver Planes','plans','read','',0,'2025-08-16 23:51:58.253575','2025-08-16 23:51:58.253575','Planes',13),(23,'Modificar Plan','plans','update','',0,'2025-08-16 23:51:58.262350','2025-08-16 23:51:58.262350','Planes',13),(24,'Eliminar Plan','plans','delete','',0,'2025-08-16 23:51:58.273776','2025-08-16 23:51:58.273776','Planes',13),(25,'Crear Servicio','services','create','',0,'2025-08-16 23:51:58.278737','2025-08-16 23:51:58.278737','Servicios',12),(26,'Ver Servicios','services','read','',0,'2025-08-16 23:51:58.282887','2025-08-16 23:51:58.282887','Servicios',12),(27,'Modificar Servicio','services','update','',0,'2025-08-16 23:51:58.286906','2025-08-16 23:51:58.286906','Servicios',12),(28,'Eliminar Servicio','services','delete','',0,'2025-08-16 23:51:58.291169','2025-08-16 23:51:58.291169','Servicios',12),(29,'Ver Reportes','reports','read','',0,'2025-08-16 23:51:58.296062','2025-08-16 23:51:58.296062','Reportes',7),(30,'Ver Empresa','company','read','',0,'2025-08-16 23:51:58.301523','2025-08-16 23:51:58.301523','Empresa',11),(31,'Modificar Empresa','company','update','',0,'2025-08-16 23:51:58.305715','2025-08-16 23:51:58.305715','Empresa',11),(32,'Crear Usuario','users','create','',0,'2025-08-16 23:51:58.310526','2025-08-16 23:51:58.310526','Usuarios',8),(33,'Ver Usuarios','users','read','',0,'2025-08-16 23:51:58.314843','2025-08-16 23:51:58.314843','Usuarios',8),(34,'Modificar Usuario','users','update','',0,'2025-08-16 23:51:58.319180','2025-08-16 23:51:58.319180','Usuarios',8),(35,'Eliminar Usuario','users','delete','',0,'2025-08-16 23:51:58.323253','2025-08-16 23:51:58.323253','Usuarios',8),(36,'Crear Rol','roles','create','',0,'2025-08-16 23:51:58.328102','2025-08-16 23:51:58.328102','Roles',9),(37,'Ver Roles','roles','read','',0,'2025-08-16 23:51:58.332429','2025-08-16 23:51:58.332429','Roles',9),(38,'Modificar Rol','roles','update','',0,'2025-08-16 23:51:58.336950','2025-08-16 23:51:58.336950','Roles',9),(39,'Eliminar Rol','roles','delete','',0,'2025-08-16 23:51:58.341280','2025-08-16 23:51:58.341280','Roles',9),(40,'Ver Permisos','permissions','read','',0,'2025-08-16 23:51:58.346137','2025-08-16 23:51:58.346137','Permisos',10);
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,'PLAN 40',40.00,'PLAN ECONOMICO',10,'2025-05-05 09:38:17.223122','2025-05-09 18:59:50.000000',1),(2,'Plan 100 Mbs',50.00,'',100,'2025-05-05 11:54:13.259014','2025-05-05 11:54:13.259014',2),(3,'PLAN 50',50.00,'',10,'2025-05-05 20:27:40.539880','2025-05-05 20:27:40.539880',1),(4,'Intenet Fibra',70.00,'',200,'2025-05-30 17:21:36.079284','2025-05-30 17:21:36.079284',2),(5,'PLAN 70',70.00,'',20,'2025-06-04 02:55:25.516742','2025-06-04 02:55:25.516742',1),(6,'PLAN 80',80.00,'',250,'2025-06-04 03:23:09.851571','2025-06-04 03:23:48.000000',2);
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `routeCode` varchar(255) NOT NULL,
  `displayName` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `orderIndex` int(11) DEFAULT 0,
  `created_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1204c2dbd2503acd7e6b377585` (`routeCode`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,'dashboard','Dashboard','Panel principal del sistema',1,1,'2025-08-16 23:51:58.067475','2025-08-16 23:51:58.067475'),(2,'clients','Clientes','Gestión de clientes',1,2,'2025-08-16 23:51:58.072858','2025-08-16 23:51:58.072858'),(3,'payments','Pagos','Gestión de pagos',1,3,'2025-08-16 23:51:58.082127','2025-08-16 23:51:58.082127'),(4,'installations','Instalaciones','Gestión de instalaciones',1,4,'2025-08-16 23:51:58.086826','2025-08-16 23:51:58.086826'),(5,'devices','Dispositivos','Gestión de dispositivos',1,5,'2025-08-16 23:51:58.091280','2025-08-16 23:51:58.091280'),(6,'employees','Empleados','Gestión de empleados',1,6,'2025-08-16 23:51:58.095890','2025-08-16 23:51:58.095890'),(7,'reports','Reportes','Generación de reportes',1,7,'2025-08-16 23:51:58.100680','2025-08-16 23:51:58.100680'),(8,'users','Usuarios','Gestión de usuarios del sistema',1,8,'2025-08-16 23:51:58.105704','2025-08-16 23:51:58.105704'),(9,'roles','Roles','Gestión de roles y permisos',1,9,'2025-08-16 23:51:58.110682','2025-08-16 23:51:58.110682'),(10,'permissions','Permisos','Gestión granular de permisos',1,10,'2025-08-16 23:51:58.115446','2025-08-16 23:51:58.115446'),(11,'company','Empresa','Configuración de la empresa',1,11,'2025-08-16 23:51:58.120497','2025-08-16 23:51:58.120497'),(12,'services','Servicios','Gestión de servicios',1,12,'2025-08-16 23:51:58.125416','2025-08-16 23:51:58.125416'),(13,'plans','Planes','Gestión de planes',1,13,'2025-08-16 23:51:58.129731','2025-08-16 23:51:58.129731'),(14,'sectors','Sectores','Gestión de sectores',1,14,'2025-08-16 23:51:58.134536','2025-08-16 23:51:58.134536');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sectors`
--

LOCK TABLES `sectors` WRITE;
/*!40000 ALTER TABLE `sectors` DISABLE KEYS */;
INSERT INTO `sectors` VALUES (1,'Tarica','','2025-05-05 09:37:34.625280','2025-05-09 14:53:01.000000'),(2,'Huantallon','','2025-05-05 11:44:28.710606','2025-05-05 11:44:28.710606'),(3,'Mullaca','','2025-05-05 11:44:58.332958','2025-05-05 11:44:58.332958'),(4,'Uchuyacu','','2025-05-05 11:45:37.326344','2025-05-05 11:45:37.326344'),(5,'Santa Rosa','','2025-05-05 11:46:02.465900','2025-05-05 11:46:02.465900'),(6,'Monterrey','','2025-05-05 11:46:45.187081','2025-05-05 11:46:45.187081'),(7,'Chavin','','2025-05-05 11:47:21.925758','2025-05-05 11:47:21.925758'),(8,'Carianpampa','','2025-05-05 11:48:03.703310','2025-05-05 11:48:03.703310'),(9,'San Miguel','','2025-05-05 20:28:04.737306','2025-05-05 20:28:04.737306'),(10,'Tumpa','','2025-05-05 20:28:14.581744','2025-05-05 20:28:14.581744'),(11,'Chontayoc','','2025-06-20 18:05:58.460290','2025-06-20 18:05:58.460290'),(12,'Quichirragra','','2025-06-20 18:06:46.340321','2025-06-20 18:06:46.340321'),(13,'Mirgas','','2025-06-20 18:06:57.825896','2025-06-20 18:06:57.825896');
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

-- Dump completed on 2025-08-16 18:53:11
