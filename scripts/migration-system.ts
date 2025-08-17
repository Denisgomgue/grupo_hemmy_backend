#!/usr/bin/env ts-node

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const execAsync = promisify(exec);

interface MigrationConfig {
    database: string;
    host: string;
    port: string;
    username: string;
    password: string;
}

interface MigrationStep {
    name: string;
    description: string;
    sqlFile: string;
    rollbackFile?: string;
}

class DatabaseMigration {
    private config: MigrationConfig;
    private rl: readline.Interface;
    private backupPath: string = '';

    constructor(config: MigrationConfig) {
        this.config = config;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    private async question(prompt: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    private async log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            error: '\x1b[31m',   // Red
            warning: '\x1b[33m'  // Yellow
        };
        const reset = '\x1b[0m';
        const timestamp = new Date().toISOString();
        console.log(`${colors[ type ]}[${timestamp}] ${message}${reset}`);
    }

    private async executeSQL(sqlFile: string, description: string): Promise<boolean> {
        try {
            this.log(`🔄 Ejecutando: ${description}`, 'info');

            const filePath = path.join(__dirname, sqlFile);
            if (!fs.existsSync(filePath)) {
                this.log(`❌ Archivo SQL no encontrado: ${filePath}`, 'error');
                return false;
            }

            const connectionString = `-h${this.config.host} -P${this.config.port} -u${this.config.username}`;
            const passwordParam = this.config.password ? ` -p${this.config.password}` : '';
            const command = `mysql ${connectionString}${passwordParam} ${this.config.database} < "${filePath}"`;

            const { stdout, stderr } = await execAsync(command);

            if (stderr && !stderr.includes('Warning')) {
                this.log(`❌ Error en ${description}: ${stderr}`, 'error');
                return false;
            }

            this.log(`✅ ${description} completado exitosamente`, 'success');
            return true;
        } catch (error) {
            this.log(`❌ Error ejecutando ${description}: ${error}`, 'error');
            return false;
        }
    }

    private async createBackup(): Promise<boolean> {
        try {
            this.log('💾 Creando backup de la base de datos...', 'info');

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            this.backupPath = `backup-pre-migration-${timestamp}.sql`;

            const connectionString = `-h${this.config.host} -P${this.config.port} -u${this.config.username}`;
            const passwordParam = this.config.password ? ` -p${this.config.password}` : '';
            const command = `mysqldump ${connectionString}${passwordParam} ${this.config.database} > "${this.backupPath}"`;

            const { stdout, stderr } = await execAsync(command);

            if (stderr && !stderr.includes('Warning')) {
                this.log(`❌ Error al crear backup: ${stderr}`, 'error');
                return false;
            }

            this.log(`✅ Backup creado: ${this.backupPath}`, 'success');
            return true;
        } catch (error) {
            this.log(`❌ Error al crear backup: ${error}`, 'error');
            return false;
        }
    }

    private async checkMySQLConnection(): Promise<boolean> {
        try {
            const { stdout } = await execAsync('mysql --version');
            this.log(`✅ MySQL CLI encontrado: ${stdout.trim()}`, 'success');
            return true;
        } catch (error) {
            this.log('❌ MySQL CLI no encontrado. Por favor, instale MySQL Client.', 'error');
            return false;
        }
    }

    private async confirmAction(message: string): Promise<boolean> {
        const response = await this.question(`⚠️  ${message} (s/N): `);
        return response.toLowerCase() === 's' || response.toLowerCase() === 'y';
    }

    private async showConfiguration(): Promise<void> {
        this.log('📋 Configuración de migración:', 'info');
        this.log(`   Base de datos: ${this.config.database}`, 'info');
        this.log(`   Host: ${this.config.host}`, 'info');
        this.log(`   Puerto: ${this.config.port}`, 'info');
        this.log(`   Usuario: ${this.config.username}`, 'info');
    }

    // TAREA 1: Verificar entorno
    async verifyEnvironment(): Promise<boolean> {
        this.log('🔍 Verificando entorno...', 'info');

        if (!await this.checkMySQLConnection()) {
            return false;
        }

        this.log('✅ Entorno verificado correctamente', 'success');
        return true;
    }

    // TAREA 2: Crear backup
    async createBackupTask(): Promise<boolean> {
        this.log('📦 TAREA 2: Crear backup de seguridad', 'warning');

        if (!await this.createBackup()) {
            const shouldContinue = await this.confirmAction('No se pudo crear el backup. ¿Desea continuar de todas formas?');
            if (!shouldContinue) {
                return false;
            }
        }

        return true;
    }

    // TAREA 2.5: Diagnóstico de tablas (opcional)
    async diagnoseTables(): Promise<boolean> {
        this.log('🔍 TAREA 2.5: Diagnóstico de tablas (OPCIONAL)', 'warning');

        const shouldDiagnose = await this.confirmAction('¿Desea ejecutar el diagnóstico de tablas antes de la migración?');

        if (shouldDiagnose) {
            if (!await this.executeSQL('00-diagnose-tables.sql', 'Diagnóstico de estructura de tablas')) {
                this.log('❌ Error en diagnóstico', 'error');
                const shouldContinue = await this.confirmAction('¿Desea continuar con la migración de todas formas?');
                if (!shouldContinue) {
                    return false;
                }
            } else {
                this.log('✅ Diagnóstico completado', 'success');
                this.log('💡 Revise la salida del diagnóstico para verificar la estructura de las tablas', 'info');
            }
        } else {
            this.log('⏭️  Diagnóstico omitido por el usuario', 'info');
        }

        return true;
    }

    // TAREA 3: Ejecutar migración principal
    async executeMainMigration(): Promise<boolean> {
        this.log('🚀 TAREA 3: Ejecutar migración principal', 'warning');

        const steps: MigrationStep[] = [
            {
                name: 'create_tables',
                description: 'Crear nuevas tablas',
                sqlFile: '01-create-new-tables.sql'
            },
            {
                name: 'migrate_clients',
                description: 'Migrar clientes',
                sqlFile: '02-migrate-clients.sql'
            },
            {
                name: 'migrate_installations',
                description: 'Migrar instalaciones',
                sqlFile: '03-migrate-installations.sql'
            },
            {
                name: 'migrate_payment_configs',
                description: 'Migrar configuraciones de pago',
                sqlFile: '04-migrate-payment-configs.sql'
            },
            {
                name: 'migrate_payments',
                description: 'Migrar pagos',
                sqlFile: '05-migrate-payments.sql'
            },
            {
                name: 'migrate_payment_histories',
                description: 'Migrar historial de pagos',
                sqlFile: '06-migrate-payment-histories.sql'
            },
            {
                name: 'migrate_devices',
                description: 'Migrar dispositivos',
                sqlFile: '07-migrate-devices.sql'
            },
            {
                name: 'add_foreign_keys',
                description: 'Agregar claves foráneas',
                sqlFile: '08-add-foreign-keys.sql'
            }
        ];

        for (const step of steps) {
            if (!await this.executeSQL(step.sqlFile, step.description)) {
                this.log(`❌ Error en paso: ${step.name}`, 'error');
                return false;
            }
        }

        this.log('✅ Migración principal completada', 'success');
        return true;
    }

    // TAREA 4: Verificación inicial de migración
    async verifyInitialMigration(): Promise<boolean> {
        this.log('🔍 TAREA 4: Verificación inicial de migración', 'warning');

        if (!await this.executeSQL('09-verify-migration.sql', 'Verificación inicial de migración')) {
            this.log('❌ Error en verificación inicial', 'error');
            return false;
        }

        this.log('✅ Verificación inicial completada', 'success');
        return true;
    }

    // TAREA 5: Verificación final completa
    async verifyFinalMigration(): Promise<boolean> {
        this.log('🔍 TAREA 5: Verificación final completa', 'warning');

        if (!await this.executeSQL('12-verify-final-migration.sql', 'Verificación final completa de migración')) {
            this.log('❌ Error en verificación final', 'error');
            return false;
        }

        this.log('✅ Verificación final completada', 'success');
        return true;
    }

    // TAREA 6: Limpiar tablas antiguas (opcional)
    async cleanupOldTables(): Promise<boolean> {
        this.log('🧹 TAREA 6: Limpiar tablas antiguas (OPCIONAL)', 'warning');

        const shouldCleanup = await this.confirmAction('¿Desea eliminar las tablas antiguas (client, payment, payment_history)?');

        if (shouldCleanup) {
            if (!await this.executeSQL('10-cleanup-old-tables.sql', 'Limpieza de tablas antiguas')) {
                this.log('❌ Error en limpieza', 'error');
                return false;
            }
            this.log('✅ Limpieza completada', 'success');
        } else {
            this.log('⏭️  Limpieza omitida por el usuario', 'info');
        }

        return true;
    }

    // Ejecutar solo diagnóstico
    async runDiagnosisOnly(): Promise<void> {
        try {
            this.log('=====================================================', 'info');
            this.log('DIAGNÓSTICO DE TABLAS - GRUPO HEMMY', 'info');
            this.log('=====================================================', 'info');

            await this.showConfiguration();

            if (!await this.verifyEnvironment()) {
                this.log('❌ No se puede ejecutar el diagnóstico', 'error');
                return;
            }

            if (!await this.executeSQL('00-diagnose-tables.sql', 'Diagnóstico de estructura de tablas')) {
                this.log('❌ Error en diagnóstico', 'error');
                return;
            }

            this.log('✅ Diagnóstico completado exitosamente', 'success');
            this.log('\n📝 Información del diagnóstico:', 'info');
            this.log('   1. Revise la salida anterior para ver la estructura de las tablas', 'info');
            this.log('   2. Verifique que las columnas y relaciones sean correctas', 'info');
            this.log('   3. Si hay errores, corrija los scripts de migración', 'info');

        } catch (error) {
            this.log(`❌ Error inesperado: ${error}`, 'error');
        } finally {
            this.rl.close();
        }
    }

    // Ejecutar migración completa
    async run(): Promise<void> {
        try {
            this.log('=====================================================', 'info');
            this.log('SISTEMA DE MIGRACIÓN GRUPO HEMMY - TYPESCRIPT', 'info');
            this.log('=====================================================', 'info');

            await this.showConfiguration();

            const shouldContinue = await this.confirmAction('¿Está seguro de que desea iniciar la migración?');
            if (!shouldContinue) {
                this.log('❌ Migración cancelada por el usuario', 'error');
                return;
            }

            // Ejecutar tareas en secuencia
            const tasks = [
                { name: 'Verificar entorno', task: () => this.verifyEnvironment() },
                { name: 'Crear backup', task: () => this.createBackupTask() },
                { name: 'Diagnóstico de tablas', task: () => this.diagnoseTables() },
                { name: 'Migración principal', task: () => this.executeMainMigration() },
                { name: 'Verificación inicial', task: () => this.verifyInitialMigration() },
                { name: 'Verificación final', task: () => this.verifyFinalMigration() },
                { name: 'Limpieza opcional', task: () => this.cleanupOldTables() }
            ];

            for (const { name, task } of tasks) {
                this.log(`\n�� Ejecutando: ${name}`, 'warning');
                if (!await task()) {
                    this.log(`❌ Error en tarea: ${name}`, 'error');
                    this.log('💡 Puede restaurar desde el backup si es necesario', 'info');
                    return;
                }
            }

            this.log('\n�� ¡Migración completada exitosamente!', 'success');
            this.log('\n📝 Próximos pasos:', 'info');
            this.log('   1. Verificar que la aplicación funciona correctamente', 'info');
            this.log('   2. Probar las funcionalidades principales', 'info');
            this.log('   3. Si todo está bien, puede eliminar el backup', 'info');
            this.log('   4. Revisar el reporte de verificación final', 'info');

        } catch (error) {
            this.log(`❌ Error inesperado: ${error}`, 'error');
        } finally {
            this.rl.close();
        }
    }
}

// Función principal
async function main() {
    const config: MigrationConfig = {
        database: process.env.DB_DATABASE || 'group_hemmy',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'admin123'
    };

    const migration = new DatabaseMigration(config);

    // Verificar si se pasó un argumento de línea de comandos
    const args = process.argv.slice(2);

    if (args.includes('--diagnose') || args.includes('-d')) {
        // Ejecutar solo diagnóstico
        await migration.runDiagnosisOnly();
    } else if (args.includes('--help') || args.includes('-h')) {
        // Mostrar ayuda
        console.log(`
🔧 SISTEMA DE MIGRACIÓN GRUPO HEMMY - TYPESCRIPT

📋 USO:
  npm run migrate              # Migración completa
  npm run migrate --diagnose   # Solo diagnóstico de tablas
  npm run migrate --help       # Mostrar esta ayuda

📝 OPCIONES:
  --diagnose, -d    Ejecutar solo diagnóstico de estructura de tablas
  --help, -h        Mostrar esta ayuda

💡 RECOMENDACIÓN:
  Si es la primera vez, ejecute primero el diagnóstico para verificar
  la estructura de las tablas antes de proceder con la migración.
        `);
    } else {
        // Ejecutar migración completa
        await migration.run();
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main().catch(console.error);
}

export { DatabaseMigration, MigrationConfig };