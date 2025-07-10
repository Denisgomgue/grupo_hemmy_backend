# 🚀 Sistema de Migración Grupo Hemmy

Sistema de migración de base de datos desarrollado en TypeScript para transformar la estructura de base de datos de Grupo Hemmy.

## 📋 Características

- ✅ **Tareas fraccionadas**: Cada paso de migración es independiente
- ✅ **Verificación automática**: Control de integridad de datos
- ✅ **Backup automático**: Creación de respaldo antes de migrar
- ✅ **Logging detallado**: Información clara de cada paso
- ✅ **Rollback seguro**: Posibilidad de restaurar desde backup
- ✅ **Interfaz interactiva**: Confirmaciones paso a paso

## 🛠️ Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **MySQL Client** instalado y en PATH
3. **Acceso a la base de datos** `group_hemmy`

## 📦 Instalación

```bash
# Navegar al directorio de scripts
cd scripts

# Instalar dependencias
npm install

# Verificar instalación
npm run test
```

## 🚀 Uso

### Migración Completa (Recomendado)

```bash
npm run migrate
```

### Solo Verificación

```bash
npm run migrate:verify
```

### Solo Limpieza (Después de verificar)

```bash
npm run migrate:cleanup
```

## 📁 Estructura de Archivos

```
scripts/
├── migration-system.ts          # Sistema principal de migración
├── package.json                 # Dependencias y scripts
├── README.md                    # Este archivo
├── 01-create-new-tables.sql    # Crear tablas nuevas
├── 02-migrate-clients.sql       # Migrar clientes
├── 03-migrate-installations.sql # Migrar instalaciones
├── 04-migrate-payment-configs.sql # Migrar configuraciones de pago
├── 05-migrate-payments.sql      # Migrar pagos
├── 06-migrate-payment-histories.sql # Migrar historial de pagos
├── 07-migrate-devices.sql       # Migrar dispositivos
├── 08-add-foreign-keys.sql      # Agregar claves foráneas
├── 09-verify-migration.sql      # Verificar migración
└── 10-cleanup-old-tables.sql    # Limpiar tablas antiguas
```

## 🔄 Proceso de Migración

### TAREA 1: Verificar Entorno

- ✅ Verificar MySQL CLI
- ✅ Verificar conexión a base de datos

### TAREA 2: Crear Backup

- ✅ Crear backup automático con timestamp
- ✅ Verificar integridad del backup

### TAREA 3: Migración Principal

1. **Crear nuevas tablas** (`01-create-new-tables.sql`)
2. **Migrar clientes** (`02-migrate-clients.sql`)
3. **Migrar instalaciones** (`03-migrate-installations.sql`)
4. **Migrar configuraciones de pago** (`04-migrate-payment-configs.sql`)
5. **Migrar pagos** (`05-migrate-payments.sql`)
6. **Migrar historial de pagos** (`06-migrate-payment-histories.sql`)
7. **Migrar dispositivos** (`07-migrate-devices.sql`)
8. **Agregar claves foráneas** (`08-add-foreign-keys.sql`)

### TAREA 4: Verificar Migración

- ✅ Verificar estructura de tablas
- ✅ Comparar conteos de registros
- ✅ Verificar integridad de datos
- ✅ Generar reporte de verificación

### TAREA 5: Limpieza (Opcional)

- ✅ Eliminar tablas antiguas
- ✅ Verificar limpieza exitosa

## 🔧 Configuración

### Variables de Entorno

Puedes configurar la conexión usando variables de entorno:

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USERNAME=root
export DB_PASSWORD=tu_contraseña
export DB_DATABASE=group_hemmy
```

### Configuración Manual

Si no usas variables de entorno, el sistema usará valores por defecto:

- **Host**: localhost
- **Puerto**: 3306
- **Usuario**: root
- **Base de datos**: group_hemmy

## 📊 Tablas Migradas

### Tablas Antiguas → Nuevas

| Antigua           | Nueva                    | Descripción                    |
| ----------------- | ------------------------ | ------------------------------ |
| `client`          | `clients`                | Información básica de clientes |
| -                 | `installations`          | Datos de instalación           |
| -                 | `client_payment_configs` | Configuración de pagos         |
| `payment`         | `payments`               | Registro de pagos              |
| `payment_history` | `payment_histories`      | Historial de pagos             |
| -                 | `devices`                | Dispositivos asignados         |
| -                 | `employees`              | Empleados del sistema          |

### Campos Migrados

#### client → clients

- ✅ `id`, `name`, `lastName`, `dni`, `phone`, `address`, `status`
- ✅ `created_at`, `updated_at`

#### client → installations

- ✅ `installationDate` ← `installationDate`
- ✅ `reference` ← `description`
- ✅ `ipAddress`, `referenceImage`
- ✅ `clientId`, `planId`, `sectorId`

#### client → client_payment_configs

- ✅ `initialPaymentDate`, `advancePayment`, `paymentStatus`

#### payment → payments

- ✅ Todos los campos migrados con mapeo correcto
- ✅ `clientId` actualizado para referenciar nueva tabla `clients`

#### Dispositivos

- ✅ `routerSerial` → `devices` (tipo: 'router')
- ✅ `decoSerial` → `devices` (tipo: 'deco')

## 🚨 Manejo de Errores

### Errores Comunes

1. **MySQL CLI no encontrado**

   ```bash
   # Instalar MySQL Client
   # Windows: Descargar desde mysql.com
   # Linux: sudo apt-get install mysql-client
   ```

2. **Error de conexión**

   ```bash
   # Verificar credenciales
   mysql -u root -p group_hemmy
   ```

3. **Error de permisos**
   ```bash
   # Verificar permisos de usuario
   GRANT ALL PRIVILEGES ON group_hemmy.* TO 'root'@'localhost';
   ```

### Restauración desde Backup

Si algo sale mal, puedes restaurar desde el backup:

```bash
# Restaurar base de datos
mysql -u root -p group_hemmy < backup-pre-migration-YYYYMMDD_HHMMSS.sql
```

## 📝 Logs y Verificación

### Verificar Estado de Migraciones

```sql
SELECT * FROM migrations ORDER BY executed_at DESC;
```

### Verificar Integridad

```sql
-- Verificar clientes migrados
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM client;

-- Verificar pagos migrados
SELECT COUNT(*) FROM payments;
SELECT COUNT(*) FROM payment;
```

## 🔍 Comandos Útiles

### Verificar Solo

```bash
# Ejecutar solo verificación
mysql -u root -p group_hemmy < 09-verify-migration.sql
```

### Limpiar Solo

```bash
# Ejecutar solo limpieza (después de verificar)
mysql -u root -p group_hemmy < 10-cleanup-old-tables.sql
```

### Backup Manual

```bash
# Crear backup manual
mysqldump -u root -p group_hemmy > backup-manual-$(date +%Y%m%d_%H%M%S).sql
```

## ⚠️ Advertencias Importantes

1. **Siempre hacer backup** antes de ejecutar
2. **Verificar en entorno de desarrollo** primero
3. **No ejecutar en producción** sin pruebas previas
4. **Revisar logs** después de cada paso
5. **Verificar aplicación** después de migración

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del sistema
2. Verifica la conectividad a MySQL
3. Confirma que tienes permisos suficientes
4. Revisa que las tablas antiguas existan
5. Contacta al equipo de desarrollo

## 📈 Próximos Pasos

Después de la migración exitosa:

1. ✅ Verificar que la aplicación funciona
2. ✅ Probar funcionalidades principales
3. ✅ Verificar reportes y consultas
4. ✅ Eliminar backup si todo está bien
5. ✅ Documentar cambios realizados

---

**Desarrollado para Grupo Hemmy** 🏢
