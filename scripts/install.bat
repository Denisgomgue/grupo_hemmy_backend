@echo off
echo =====================================================
echo INSTALACION DEL SISTEMA DE MIGRACION GRUPO HEMMY
echo =====================================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no encontrado
    echo Por favor, instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo Verificando MySQL CLI...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL CLI no encontrado
    echo Por favor, instale MySQL Client desde https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)
echo ✓ MySQL CLI encontrado

echo.
echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo =====================================================
echo INSTALACION COMPLETADA EXITOSAMENTE
echo =====================================================
echo.
echo Para ejecutar la migración:
echo   npm run migrate
echo.
echo Para verificar solo:
echo   npm run migrate:verify
echo.
echo Para limpiar tablas antiguas:
echo   npm run migrate:cleanup
echo.
pause 