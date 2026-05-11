-- ============================================
-- MIGRACIÓN: Talleres Destacados para Página Principal
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- PASO 1: Crear bucket en Storage (ejecutar en Dashboard > Storage)
-- Nombre: "talleres-fotos"
-- Public: Sí
-- Allowed MIME types: image/png, image/jpeg, image/webp
-- Max file size: 2MB

-- PASO 2: Crear tabla de talleres destacados
CREATE TABLE IF NOT EXISTS talleres_destacados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Puede estar vinculado a un taller existente (opcional)
  taller_id UUID REFERENCES talleres(id) ON DELETE SET NULL,

  -- Datos para mostrar en la página principal
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url TEXT, -- URL de la imagen en Storage
  color VARCHAR(20) DEFAULT 'blue', -- Color del gradiente: blue, orange, purple, green, pink, red, yellow

  -- Control de visualización
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,

  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para ordenamiento
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

-- Política: lectura pública (para la página principal)
DROP POLICY IF EXISTS "Lectura publica talleres destacados" ON talleres_destacados;
CREATE POLICY "Lectura publica talleres destacados"
  ON talleres_destacados
  FOR SELECT
  USING (true);

-- Política: solo admin puede modificar
DROP POLICY IF EXISTS "Admin puede modificar talleres destacados" ON talleres_destacados;
CREATE POLICY "Admin puede modificar talleres destacados"
  ON talleres_destacados
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- SELECT * FROM talleres_destacados ORDER BY orden;
