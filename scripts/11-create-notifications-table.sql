-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('CLIENT_SUSPENDED','CLIENT_ACTIVATED','PAYMENT_DUE_SOON','PAYMENT_OVERDUE','PAYMENT_RECEIVED','CLIENT_DEACTIVATED','SYSTEM_ALERT') NOT NULL,
  `status` enum('UNREAD','READ') NOT NULL DEFAULT 'UNREAD',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `metadata` json DEFAULT NULL,
  `clientId` int DEFAULT NULL,
  `paymentId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_notifications_type` (`type`),
  KEY `IDX_notifications_status` (`status`),
  KEY `IDX_notifications_clientId` (`clientId`),
  KEY `IDX_notifications_userId` (`userId`),
  KEY `IDX_notifications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 