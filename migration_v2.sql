-- Migration v2: Evaluation fields for constancias (IT Matehuala official rubric)
-- Run this in Supabase SQL Editor if the database was already created with schema.sql v1

-- Update email constraint to allow any valid email (not just @matehuala.tecnm.mx)
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_email_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_check
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE constancias
  ADD COLUMN IF NOT EXISTS taller_id             UUID REFERENCES talleres(id),
  ADD COLUMN IF NOT EXISTS nivel_desempeno       TEXT
    CHECK (nivel_desempeno IN ('INSUFICIENTE','SUFICIENTE','BUENO','NOTABLE','EXCELENTE')),
  ADD COLUMN IF NOT EXISTS criterios_evaluacion  JSONB,
  ADD COLUMN IF NOT EXISTS evaluado_por_nombre   TEXT,
  ADD COLUMN IF NOT EXISTS evaluado_en           TIMESTAMPTZ;

-- Migration v2b: Contact form submissions
CREATE TABLE IF NOT EXISTS contactos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(200) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  asunto     VARCHAR(200),
  mensaje    TEXT NOT NULL,
  leido      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
