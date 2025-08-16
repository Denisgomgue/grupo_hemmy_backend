# =====================================================
# SCRIPT DE MIGRACIÓN GRUPO HEMMY - WINDOWS
# =====================================================

param(
    [string]$DatabaseName = "group_hemmy",
    [string]$ServerHost = "localhost",
    [string]$Port = "3306",
    [string]$Username = "root",
    [string]$Password = ""
)

# Configuración de colores para output
$Host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "SISTEMA DE MIGRACIÓN GRUPO HEMMY - WINDOWS" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
$Host.UI.RawUI.ForegroundColor = "White"

# Función para verificar si MySQL está disponible
function Test-MySQLConnection {
    param([string]$ConnectionString)
    
    try {
        $result = mysql --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MySQL CLI encontrado" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "✗ MySQL CLI no encontrado" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "✗ Error al verificar MySQL CLI" -ForegroundColor Red
        return $false
    }
}

# Función para ejecutar script SQL
function Invoke-SQLScript {
    param(
        [string]$ScriptPath,
        [string]$Description
    )
    
    Write-Host "`n🔄 Ejecutando: $Description" -ForegroundColor Yellow
    
    $connectionString = "-h$ServerHost -P$Port -u$Username"
    if ($Password) {
        $connectionString += " -p$Password"
    }
    $connectionString += " $DatabaseName"
    
    try {
        $output = mysql $connectionString.Split(' ') -e "source $ScriptPath" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $Description completado exitosamente" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "✗ Error en $Description" -ForegroundColor Red
            Write-Host "Error: $output" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "✗ Error al ejecutar $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para crear backup
function New-DatabaseBackup {
    Write-Host "`n💾 Creando backup de la base de datos..." -ForegroundColor Yellow
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "backup-pre-migration-$timestamp.sql"
    
    $connectionString = "-h$ServerHost -P$Port -u$Username"
    if ($Password) {
        $connectionString += " -p$Password"
    }
    $connectionString += " $DatabaseName"
    
    try {
        $output = mysqldump $connectionString.Split(' ') --result-file="$backupPath" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Backup creado: $backupPath" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "✗ Error al crear backup" -ForegroundColor Red
            Write-Host "Error: $output" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "✗ Error al crear backup" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para solicitar confirmación
function Request-Confirmation {
    param([string]$Message)
    
    Write-Host "`n⚠️  $Message" -ForegroundColor Yellow
    $response = Read-Host "¿Desea continuar? (s/N)"
    return $response -eq "s" -or $response -eq "S" -or $response -eq "y" -or $response -eq "Y"
}

# Función principal
function Start-Migration {
    Write-Host "`n🚀 Iniciando proceso de migración..." -ForegroundColor Cyan
    
    # Verificar MySQL CLI
    if (-not (Test-MySQLConnection)) {
        Write-Host "`n❌ No se puede continuar sin MySQL CLI" -ForegroundColor Red
        Write-Host "Por favor, instale MySQL Client o agregue mysql.exe al PATH" -ForegroundColor Red
        return
    }
    
    # Solicitar parámetros si no se proporcionaron
    if (-not $Password) {
        $Password = Read-Host "Ingrese la contraseña de MySQL (deje vacío si no tiene)"
    }
    
    # Mostrar configuración
    Write-Host "`n📋 Configuración de migración:" -ForegroundColor Cyan
    Write-Host "   Base de datos: $DatabaseName" -ForegroundColor White
    Write-Host "   Host: $ServerHost" -ForegroundColor White
    Write-Host "   Puerto: $Port" -ForegroundColor White
    Write-Host "   Usuario: $Username" -ForegroundColor White
    
    # Confirmar inicio
    if (-not (Request-Confirmation "¿Está seguro de que desea iniciar la migración?")) {
        Write-Host "`n❌ Migración cancelada por el usuario" -ForegroundColor Red
        return
    }
    
    # Crear backup
    if (-not (New-DatabaseBackup)) {
        if (-not (Request-Confirmation "No se pudo crear el backup. ¿Desea continuar de todas formas?")) {
            Write-Host "`n❌ Migración cancelada" -ForegroundColor Red
            return
        }
    }
    
    # Ejecutar migración principal
    $scriptPath = Join-Path $PSScriptRoot "migration-system.sql"
    if (-not (Invoke-SQLScript -ScriptPath $scriptPath -Description "Migración principal de la base de datos")) {
        Write-Host "`n❌ Error en la migración principal" -ForegroundColor Red
        return
    }
    
    # Ejecutar verificación
    $verifyPath = Join-Path $PSScriptRoot "verify-migration.sql"
    if (-not (Invoke-SQLScript -ScriptPath $verifyPath -Description "Verificación de migración")) {
        Write-Host "`n❌ Error en la verificación" -ForegroundColor Red
        return
    }
    
    # Preguntar si limpiar tablas antiguas
    if (Request-Confirmation "¿Desea eliminar las tablas antiguas (client, payment, payment_history)?") {
        $cleanupPath = Join-Path $PSScriptRoot "cleanup-old-tables.sql"
        if (-not (Invoke-SQLScript -ScriptPath $cleanupPath -Description "Limpieza de tablas antiguas")) {
            Write-Host "`n❌ Error en la limpieza de tablas antiguas" -ForegroundColor Red
            return
        }
    }
    
    Write-Host "`n🎉 ¡Migración completada exitosamente!" -ForegroundColor Green
    Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Verificar que la aplicación funciona correctamente" -ForegroundColor White
    Write-Host "   2. Probar las funcionalidades principales" -ForegroundColor White
    Write-Host "   3. Si todo está bien, puede eliminar el backup" -ForegroundColor White
}

# Ejecutar migración
Start-Migration 