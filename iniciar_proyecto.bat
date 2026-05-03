@echo off
title TallerTec Server
color 0B
echo ===================================================
echo              Iniciando TallerTec
echo ===================================================
echo.
echo [1/2] El backend (Base de Datos) ya esta alojado en Supabase (Nube).
echo [2/2] Levantando el servidor de Frontend (Next.js)...
echo.
echo El servidor estara disponible en: http://localhost:3000
echo.
echo Presiona Ctrl+C en esta ventana para detener el servidor.
echo ===================================================
echo.

npm run dev
