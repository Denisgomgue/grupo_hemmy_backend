# 📦 Backups - Grupo Hemmy

Esta carpeta contiene todos los backups de la base de datos y logs de migración.

## 📁 Estructura

```
backups/
├── README.md                           # Este archivo
├── migration-log.txt                   # Log de migraciones
├── backup-2025-07-08T15-47-01-563Z.sql # Backup automático
├── backup-2025-07-08T15-53-33-207Z.sql # Backup automático
└── ...                                 # Otros backups
```

## 🔄 Tipos de Backup

### 1. **Backups Automáticos**

- **Formato:** `backup-YYYY-MM-DDTHH-MM-SS-sssZ.sql`
- **Generado por:** Scripts de migración
- **Contenido:** Estado completo de la base de datos antes de la migración

### 2. **Logs de Migración**

- **Archivo:** `migration-log.txt`
- **Contenido:** Registro detallado de todas las operaciones de migración
- **Formato:** `[TIMESTAMP] Mensaje`

## 🚀 Comandos Útiles

### Crear Backup Manual

```bash
# Backup completo
mysqldump -u root -p group_hemmy > backups/backup-manual-$(date +%Y%m%d_%H%M%S).sql

# Backup solo estructura
mysqldump -u root -p --no-data group_hemmy > backups/structure-$(date +%Y%m%d_%H%M%S).sql

# Backup solo datos
mysqldump -u root -p --no-create-info group_hemmy > backups/data-$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup

```bash
# Restaurar backup completo
mysql -u root -p group_hemmy < backups/backup-2025-07-08T15-47-01-563Z.sql

# Restaurar en nueva base de datos
mysql -u root -p -e "CREATE DATABASE group_hemmy_restore;"
mysql -u root -p group_hemmy_restore < backups/backup-2025-07-08T15-47-01-563Z.sql
```

### Ver Logs

```bash
# Ver log completo
cat backups/migration-log.txt

# Ver últimas 50 líneas
tail -50 backups/migration-log.txt

# Buscar errores
grep "ERROR" backups/migration-log.txt
```

## 📊 Información de Backups

### Backup del 8 de Julio, 2025

- **Archivo:** `backup-2025-07-08T15-47-01-563Z.sql`
- **Tamaño:** ~2.5 MB
- **Contenido:** Estado antes de la migración
- **Tablas incluidas:** Todas las tablas originales

### Backup del 8 de Julio, 2025 (Segundo)

- **Archivo:** `backup-2025-07-08T15-53-33-207Z.sql`
- **Tamaño:** ~2.5 MB
- **Contenido:** Estado antes de la limpieza
- **Tablas incluidas:** Tablas nuevas y antiguas

## 🔍 Verificar Integridad

### Verificar Backup

```bash
# Verificar que el backup es válido
mysql -u root -p --force < backups/backup-2025-07-08T15-47-01-563Z.sql

# Verificar estructura sin restaurar
head -100 backups/backup-2025-07-08T15-47-01-563Z.sql
```

### Comparar Backups

```bash
# Comparar dos backups
diff backups/backup-2025-07-08T15-47-01-563Z.sql backups/backup-2025-07-08T15-53-33-207Z.sql
```

## ⚠️ Importante

- **Mantén múltiples backups** en diferentes ubicaciones
- **Verifica los backups** antes de usarlos en producción
- **Documenta** cuándo y por qué se creó cada backup
- **No elimines backups** hasta estar seguro de que la migración fue exitosa

## 🗂️ Organización Recomendada

```
backups/
├── README.md
├── migration-log.txt
├── automatic/                    # Backups automáticos
│   ├── pre-migration/
│   └── post-migration/
├── manual/                       # Backups manuales
│   ├── daily/
│   └── weekly/
└── archive/                      # Backups antiguos
    └── 2025-07/
```

## 🔧 Configuración de Backup Automático

Para configurar backups automáticos, puedes agregar al crontab:

```bash
# Backup diario a las 2 AM
0 2 * * * mysqldump -u root -p'password' group_hemmy > /path/to/backups/backup-$(date +\%Y\%m\%d).sql

# Limpiar backups antiguos (mantener solo 30 días)
0 3 * * * find /path/to/backups -name "backup-*.sql" -mtime +30 -delete
```

## 📞 Soporte

Si necesitas restaurar un backup:

1. **Verifica** que el backup es válido
2. **Crea** un backup del estado actual
3. **Restaura** el backup deseado
4. **Verifica** que la aplicación funciona correctamente
