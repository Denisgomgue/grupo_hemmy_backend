-- =====================================================
-- PASO 8: AGREGAR CLAVES FORÁNEAS SOLO SI NO EXISTEN Y LIMPIAR DUPLICADOS
-- =====================================================

-- Helper: Elimina cualquier FK existente sobre la columna antes de crear la tuya

-- FK_installations_client
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'installations'
  AND COLUMN_NAME = 'clientId'
  AND REFERENCED_TABLE_NAME = 'clients'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE installations DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_installations_plan
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'installations'
  AND COLUMN_NAME = 'planId'
  AND REFERENCED_TABLE_NAME = 'plans'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE installations DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_installations_sector
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'installations'
  AND COLUMN_NAME = 'sectorId'
  AND REFERENCED_TABLE_NAME = 'sectors'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE installations DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_config_installation
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'client_payment_configs'
  AND COLUMN_NAME = 'installationId'
  AND REFERENCED_TABLE_NAME = 'installations'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE client_payment_configs DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payments_client
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'payments'
  AND COLUMN_NAME = 'clientId'
  AND REFERENCED_TABLE_NAME = 'clients'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE payments DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_histories_payment
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'payment_histories'
  AND COLUMN_NAME = 'paymentId'
  AND REFERENCED_TABLE_NAME = 'payments'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE payment_histories DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_histories_client
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'payment_histories'
  AND COLUMN_NAME = 'clientId'
  AND REFERENCED_TABLE_NAME = 'clients'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE payment_histories DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_histories_user
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'payment_histories'
  AND COLUMN_NAME = 'userId'
  AND REFERENCED_TABLE_NAME = 'user'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE payment_histories DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_devices_client
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'devices'
  AND COLUMN_NAME = 'assignedClientId'
  AND REFERENCED_TABLE_NAME = 'clients'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE devices DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_devices_employee
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'devices'
  AND COLUMN_NAME = 'assignedEmployeeId'
  AND REFERENCED_TABLE_NAME = 'employees'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE devices DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_devices_installation
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'devices'
  AND COLUMN_NAME = 'assignedInstallationId'
  AND REFERENCED_TABLE_NAME = 'installations'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE devices DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_employees_role
SELECT @fk_to_drop := CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'employees'
  AND COLUMN_NAME = 'roleId'
  AND REFERENCED_TABLE_NAME = 'roles'
  AND REFERENCED_COLUMN_NAME = 'id'
  AND CONSTRAINT_NAME != 'NULL'
LIMIT 1;
SET @sql_drop := IF(@fk_to_drop IS NOT NULL, CONCAT('ALTER TABLE employees DROP FOREIGN KEY ', @fk_to_drop, ';'), NULL);
PREPARE stmt FROM @sql_drop; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ahora los bloques de creación de FK idempotentes

-- FK_installations_client
SET @fk_name := 'FK_installations_client';
SET @table_name := 'installations';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE installations ADD CONSTRAINT FK_installations_client FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_installations_client already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_installations_plan
SET @fk_name := 'FK_installations_plan';
SET @table_name := 'installations';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE installations ADD CONSTRAINT FK_installations_plan FOREIGN KEY (planId) REFERENCES plans(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_installations_plan already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_installations_sector
SET @fk_name := 'FK_installations_sector';
SET @table_name := 'installations';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE installations ADD CONSTRAINT FK_installations_sector FOREIGN KEY (sectorId) REFERENCES sectors(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_installations_sector already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_config_installation
SET @fk_name := 'FK_payment_config_installation';
SET @table_name := 'client_payment_configs';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE client_payment_configs ADD CONSTRAINT FK_payment_config_installation FOREIGN KEY (installationId) REFERENCES installations(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_payment_config_installation already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payments_client
SET @fk_name := 'FK_payments_client';
SET @table_name := 'payments';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE payments ADD CONSTRAINT FK_payments_client FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_payments_client already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_histories_payment
SET @fk_name := 'FK_payment_histories_payment';
SET @table_name := 'payment_histories';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE payment_histories ADD CONSTRAINT FK_payment_histories_payment FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_payment_histories_payment already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_histories_client
SET @fk_name := 'FK_payment_histories_client';
SET @table_name := 'payment_histories';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE payment_histories ADD CONSTRAINT FK_payment_histories_client FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_payment_histories_client already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_payment_histories_user
SET @fk_name := 'FK_payment_histories_user';
SET @table_name := 'payment_histories';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE payment_histories ADD CONSTRAINT FK_payment_histories_user FOREIGN KEY (userId) REFERENCES user(id) ON DELETE SET NULL ON UPDATE CASCADE;',
  'SELECT "Constraint FK_payment_histories_user already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_devices_client
SET @fk_name := 'FK_devices_client';
SET @table_name := 'devices';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE devices ADD CONSTRAINT FK_devices_client FOREIGN KEY (assignedClientId) REFERENCES clients(id) ON DELETE SET NULL ON UPDATE CASCADE;',
  'SELECT "Constraint FK_devices_client already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_devices_employee
SET @fk_name := 'FK_devices_employee';
SET @table_name := 'devices';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE devices ADD CONSTRAINT FK_devices_employee FOREIGN KEY (assignedEmployeeId) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE;',
  'SELECT "Constraint FK_devices_employee already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_devices_installation
SET @fk_name := 'FK_devices_installation';
SET @table_name := 'devices';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE devices ADD CONSTRAINT FK_devices_installation FOREIGN KEY (assignedInstallationId) REFERENCES installations(id) ON DELETE SET NULL ON UPDATE CASCADE;',
  'SELECT "Constraint FK_devices_installation already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FK_employees_role
SET @fk_name := 'FK_employees_role';
SET @table_name := 'employees';
SET @constraint_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = @table_name
    AND CONSTRAINT_NAME = @fk_name
);
SET @sql := IF(@constraint_exists = 0,
  'ALTER TABLE employees ADD CONSTRAINT FK_employees_role FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE;',
  'SELECT "Constraint FK_employees_role already exists, skipping...";'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Habilitar verificaciones de clave foránea
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Registrar paso completado
INSERT INTO migrations (timestamp, name, status) VALUES 
(UNIX_TIMESTAMP() * 1000, 'AddForeignKeys', 'COMPLETED');

COMMIT; 