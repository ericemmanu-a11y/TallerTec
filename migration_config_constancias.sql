-- ============================================
-- MIGRACIÓN: Configuración Dinámica de Constancias
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- PASO 1: Crear bucket en Storage (ejecutar en Dashboard > Storage)
-- Nombre: "firmas"
-- Public: Sí
-- Allowed MIME types: image/png, image/jpeg
-- Max file size: 500KB

-- PASO 2: Crear tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion_constancias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id UUID NOT NULL UNIQUE REFERENCES periodos(id) ON DELETE CASCADE,

  -- Destinatario de la carta
  destinatario_nombre VARCHAR(200) NOT NULL DEFAULT 'Lic. Martha Beatriz Coronado Rosales',
  destinatario_puesto VARCHAR(200) NOT NULL DEFAULT 'Jefa del Departamento de Servicios Escolares',

  -- Firmante 1 (Jefe de Departamento)
  firmante1_nombre VARCHAR(200) NOT NULL DEFAULT 'Ing. Mario Mata Ontiveros',
  firmante1_puesto VARCHAR(200) NOT NULL DEFAULT 'Jefe del Depto. de Actividades Extraescolares',
  firmante1_firma_url TEXT,

  -- Firmante 2 (Promotor)
  firmante2_nombre VARCHAR(200) NOT NULL DEFAULT 'Lic. Miguel Ángel Vargas Zapata',
  firmante2_puesto VARCHAR(200) NOT NULL DEFAULT 'Jefe de la Oficina de Promoción Deportiva',
  firmante2_firma_url TEXT,

  -- Datos institucionales
  valor_curricular VARCHAR(50) NOT NULL DEFAULT '1 crédito',

  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda rápida por período
CREATE INDEX IF NOT EXISTS idx_config_periodo ON configuracion_constancias(periodo_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_config_updated ON configuracion_constancias;
CREATE TRIGGER trg_config_updated
  BEFORE UPDATE ON configuracion_constancias
  FOR EACH ROW
  EXECUTE FUNCTION update_config_timestamp();

-- Habilitar RLS
ALTER TABLE configuracion_constancias ENABLE ROW LEVEL SECURITY;

-- Política: permitir todo (el control se hace a nivel de aplicación)
DROP POLICY IF EXISTS "Admin puede todo en configuracion" ON configuracion_constancias;
CREATE POLICY "Admin puede todo en configuracion"
  ON configuracion_constancias
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- SELECT * FROM configuracion_constancias;
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'configuracion_constancias';
