@echo off
echo ========================================
echo    VERIFICACION DE RECURSOS
echo ========================================
echo.

echo 🔍 Verificando recursos en la base de datos...
echo.

REM Verificar si existe el archivo .env
if not exist ".env" (
    echo ❌ No se encontró el archivo .env
    echo Por favor, asegúrate de tener configuradas las variables de entorno
    pause
    exit /b 1
)

REM Ejecutar el script SQL
echo 📊 Ejecutando consulta de verificación...
mysql -u %DB_USER% -p%DB_PASSWORD% -h %DB_HOST% %DB_NAME% -e "SELECT COUNT(*) as total_resources FROM resources;"

echo.
echo 📋 Recursos disponibles:
mysql -u %DB_USER% -p%DB_PASSWORD% -h %DB_HOST% %DB_NAME% -e "SELECT routeCode, displayName FROM resources ORDER BY orderIndex;"

echo.
echo ✅ Verificación completada
echo.
echo Si no hay recursos, ejecuta el script SQL: scripts/verify-resources.sql
echo.
pause 