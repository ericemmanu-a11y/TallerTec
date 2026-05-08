-- Tipos enumerados
CREATE TYPE rol_enum AS ENUM ('ESTUDIANTE', 'RESPONSABLE_TALLER', 'ADMIN_OFICINA');
CREATE TYPE estado_inscripcion AS ENUM ('ACTIVA', 'BAJA', 'COMPLETADA');
CREATE TYPE metodo_registro AS ENUM ('QR', 'MANUAL');
CREATE TYPE estado_constancia AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'GENERADA', 'ENTREGADA');
CREATE TYPE categoria_taller AS ENUM ('DEPORTIVO', 'CULTURAL');
CREATE TYPE tipo_notificacion AS ENUM ('INSCRIPCION', 'ASISTENCIA', 'CONSTANCIA_SOLICITUD', 'CONSTANCIA_LISTA', 'CONSTANCIA_RECHAZADA', 'META_20H');

CREATE TABLE usuarios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) NOT NULL UNIQUE
                    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  nombre_completo   VARCHAR(200) NOT NULL CHECK (char_length(nombre_completo) >= 3),
  numero_control    VARCHAR(20) UNIQUE,
  rol               rol_enum NOT NULL DEFAULT 'ESTUDIANTE',
  telefono          VARCHAR(15),
  carrera           VARCHAR(100),
  semestre          INTEGER CHECK (semestre BETWEEN 1 AND 12),
  codigo_qr         TEXT UNIQUE,
  foto_url          TEXT,
  activo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE periodos (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                   VARCHAR(100) NOT NULL UNIQUE,
  fecha_inicio             DATE NOT NULL,
  fecha_fin                DATE NOT NULL,
  inscripciones_abiertas   BOOLEAN NOT NULL DEFAULT FALSE,
  activo                   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_fechas CHECK (fecha_fin > fecha_inicio)
);

CREATE TABLE talleres (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            VARCHAR(150) NOT NULL,
  descripcion       TEXT,
  categoria         categoria_taller NOT NULL DEFAULT 'DEPORTIVO',
  horario_texto     VARCHAR(200) NOT NULL,
  ubicacion         VARCHAR(150) NOT NULL,
  cupo_maximo       INTEGER NOT NULL CHECK (cupo_maximo > 0),
  cupo_disponible   INTEGER NOT NULL CHECK (cupo_disponible >= 0),
  responsable_id    UUID NOT NULL REFERENCES usuarios(id),
  periodo_id        UUID NOT NULL REFERENCES periodos(id),
  activo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cupo CHECK (cupo_disponible <= cupo_maximo)
);
CREATE INDEX idx_talleres_periodo_activo ON talleres(periodo_id, activo);

CREATE TABLE inscripciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id       UUID NOT NULL REFERENCES usuarios(id),
  taller_id           UUID NOT NULL REFERENCES talleres(id),
  fecha_inscripcion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estado              estado_inscripcion NOT NULL DEFAULT 'ACTIVA',
  horas_acumuladas    NUMERIC(5,2) NOT NULL DEFAULT 0.00
                      CHECK (horas_acumuladas >= 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_inscripcion_periodo UNIQUE (estudiante_id, taller_id)
);
CREATE INDEX idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX idx_inscripciones_taller ON inscripciones(taller_id);

CREATE TABLE asistencias (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscripcion_id      UUID NOT NULL REFERENCES inscripciones(id),
  fecha               DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada        TIME NOT NULL,
  hora_salida         TIME,
  horas_computadas    NUMERIC(4,2) NOT NULL DEFAULT 0.00
                      CHECK (horas_computadas >= 0 AND horas_computadas <= 24),
  metodo_registro     metodo_registro NOT NULL DEFAULT 'QR',
  registrado_por      UUID NOT NULL REFERENCES usuarios(id),
  notas               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_asistencia_dia UNIQUE (inscripcion_id, fecha)
);
CREATE INDEX idx_asistencias_inscripcion ON asistencias(inscripcion_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);

CREATE TABLE constancias (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id         UUID NOT NULL REFERENCES usuarios(id),
  periodo_id            UUID NOT NULL REFERENCES periodos(id),
  taller_id             UUID REFERENCES talleres(id),
  fecha_generacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  horas_totales         NUMERIC(5,2) NOT NULL CHECK (horas_totales >= 20),
  archivo_url           TEXT,
  folio                 VARCHAR(50) UNIQUE,
  generado_por          UUID REFERENCES usuarios(id),
  estado                estado_constancia NOT NULL DEFAULT 'PENDIENTE',
  observaciones         TEXT,
  -- Evaluación del encargado (rúbrica oficial IT Matehuala)
  nivel_desempeno       TEXT CHECK (nivel_desempeno IN ('INSUFICIENTE','SUFICIENTE','BUENO','NOTABLE','EXCELENTE')),
  criterios_evaluacion  JSONB,          -- array de 7 enteros [0-4]
  evaluado_por_nombre   TEXT,           -- nombre del encargado que evaluó
  evaluado_en           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_constancia_periodo UNIQUE (estudiante_id, periodo_id)
);
CREATE INDEX idx_constancias_estudiante ON constancias(estudiante_id);
CREATE INDEX idx_constancias_estado ON constancias(estado);

CREATE TABLE notificaciones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id),
  tipo          tipo_notificacion NOT NULL,
  titulo        VARCHAR(200) NOT NULL,
  mensaje       TEXT NOT NULL,
  leida         BOOLEAN NOT NULL DEFAULT FALSE,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);

CREATE TABLE contactos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(200) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  asunto     VARCHAR(200),
  mensaje    TEXT NOT NULL,
  leido      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION calcular_horas_acumuladas()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inscripciones
  SET horas_acumuladas = (
    SELECT COALESCE(SUM(horas_computadas), 0)
    FROM asistencias
    WHERE inscripcion_id = NEW.inscripcion_id
  )
  WHERE id = NEW.inscripcion_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_horas
  AFTER INSERT OR UPDATE ON asistencias
  FOR EACH ROW
  EXECUTE FUNCTION calcular_horas_acumuladas();

CREATE OR REPLACE FUNCTION verificar_meta_20h()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.horas_acumuladas >= 20 AND OLD.horas_acumuladas < 20 THEN
    NEW.estado = 'COMPLETADA';
    INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje)
    VALUES (
      NEW.estudiante_id,
      'META_20H',
      '¡Felicidades! Completaste tus 20 horas',
      'Ya puedes solicitar tu constancia desde la app.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_meta
  BEFORE UPDATE OF horas_acumuladas ON inscripciones
  FOR EACH ROW
  EXECUTE FUNCTION verificar_meta_20h();

CREATE OR REPLACE FUNCTION generar_folio_constancia()
RETURNS TRIGGER AS $$
DECLARE
  v_anio    INTEGER := EXTRACT(YEAR FROM NOW());
  v_sem     INTEGER := CASE WHEN EXTRACT(MONTH FROM NOW()) <= 6 THEN 1 ELSE 2 END;
  v_seq     INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq FROM constancias
    WHERE EXTRACT(YEAR FROM created_at) = v_anio;
  NEW.folio := FORMAT('TALL-%s-%s-%s',
    v_anio, v_sem, LPAD(v_seq::TEXT, 5, '0'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_folio_constancia
  BEFORE INSERT ON constancias
  FOR EACH ROW
  EXECUTE FUNCTION generar_folio_constancia();

CREATE OR REPLACE FUNCTION update_cupo_disponible()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE talleres
    SET cupo_disponible = cupo_disponible - 1
    WHERE id = NEW.taller_id;
  ELSIF TG_OP = 'DELETE' OR
    (TG_OP = 'UPDATE' AND NEW.estado = 'BAJA' AND OLD.estado = 'ACTIVA') THEN
    UPDATE talleres
    SET cupo_disponible = cupo_disponible + 1
    WHERE id = COALESCE(NEW.taller_id, OLD.taller_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cupo_inscripcion
  AFTER INSERT OR UPDATE OF estado OR DELETE ON inscripciones
  FOR EACH ROW EXECUTE FUNCTION update_cupo_disponible();
