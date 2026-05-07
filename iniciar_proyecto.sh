#!/bin/bash
# Inicia el servidor de desarrollo de TallerTec y abre el navegador automáticamente

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
URL="http://localhost:3000"

echo "==================================================="
echo "             Iniciando TallerTec"
echo "==================================================="
echo ""
echo "[1/2] Backend (Base de Datos) alojado en Supabase (Nube)."
echo "[2/2] Levantando servidor Frontend (Next.js)..."
echo ""
echo "Disponible en: $URL"
echo "Presiona Ctrl+C para detener el servidor."
echo "==================================================="
echo ""

cd "$PROJECT_DIR"

# Abre el navegador tras 3 segundos (cuando el servidor ya esté listo)
(sleep 3 && sensible-browser "$URL" 2>/dev/null || xdg-open "$URL" 2>/dev/null) &

npm run dev
