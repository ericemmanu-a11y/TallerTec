-- ============================================
-- MIGRACIÓN: Talleres Destacados para Página Principal
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- =============================================
-- INSTRUCCIONES - LEER ANTES DE EJECUTAR
-- =============================================
--
-- PASO 1: Ejecutar este SQL completo en Supabase Dashboard > SQL Editor
--
-- PASO 2: Crear bucket de Storage manualmente:
--         1. Ir a Supabase Dashboard > Storage
--         2. Click "New bucket"
--         3. Nombre: talleres-fotos
--         4. Public bucket: ACTIVAR
--         5. Click "Create bucket"
--
-- PASO 3: Configurar políticas del bucket:
--         1. En Storage, click en el bucket "talleres-fotos"
--         2. Click en "Policies" (arriba a la derecha)
--         3. Agregar política SELECT: "Allow public read"
--            - Policy name: public_read
--            - Target roles: (dejar vacío para public)
--            - Policy: true
--         4. Agregar política INSERT: "Allow authenticated uploads"
--            - Policy name: authenticated_upload
--            - Target roles: authenticated
--            - Policy: true
--
-- =============================================

-- Crear tabla de talleres destacados
CREATE TABLE IF NOT EXISTS talleres_destacados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Puede estar vinculado a un taller existente (opcional)
  taller_id UUID REFERENCES talleres(id) ON DELETE SET NULL,

  -- Datos para mostrar en la página principal
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url TEXT,
  color VARCHAR(20) DEFAULT 'blue',

  -- Control de visualización
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,

  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_talleres_destacados_orden ON talleres_destacados(orden);
CREATE INDEX IF NOT EXISTS idx_talleres_destacados_activo ON talleres_destacados(activo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_talleres_destacados_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_talleres_destacados_updated ON talleres_destacados;
CREATE TRIGGER trg_talleres_destacados_updated
  BEFORE UPDATE ON talleres_destacados
  FOR EACH ROW
  EXECUTE FUNCTION update_talleres_destacados_timestamp();

-- Habilitar RLS
ALTER TABLE talleres_destacados ENABLE ROW LEVEL SECURITY;

-- Políticas de la tabla
DROP POLICY IF EXISTS "Lectura publica talleres destacados" ON talleres_destacados;
CREATE POLICY "Lectura publica talleres destacados"
  ON talleres_destacados
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin puede modificar talleres destacados" ON talleres_destacados;
CREATE POLICY "Admin puede modificar talleres destacados"
  ON talleres_destacados
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- VERIFICACIÓN - Ejecutar después para confirmar
-- =============================================
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'talleres_destacados';
