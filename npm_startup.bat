
@echo off
echo Iniciando npm run start:dev...
cd /d "D:\group_hemmy\grupo_hemmy_backend>"
start cmd /k npm run start:dev
echo Esperando a que el puerto 3001 este ocupado...
:CHECK_PORT
timeout /t 2 /nobreak >nul
netstat -aon | findstr ":3001" | findstr "LISTENING" >nul
if errorlevel 1 (
    goto CHECK_PORT
)
echo Puerto 3001 ocupado, iniciando npm run dev...
cd /d "grupo_hemmy_frontend"
start cmd /k npm run dev
exit