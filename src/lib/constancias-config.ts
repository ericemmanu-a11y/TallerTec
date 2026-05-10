// Valores por defecto para la configuración de constancias
// Este archivo NO es "use server" para poder exportar objetos

export interface ConfiguracionConstancia {
  id: string;
  periodo_id: string;
  destinatario_nombre: string;
  destinatario_puesto: string;
  firmante1_nombre: string;
  firmante1_puesto: string;
  firmante1_firma_url: string | null;
  firmante2_nombre: string;
  firmante2_puesto: string;
  firmante2_firma_url: string | null;
  valor_curricular: string;
  created_at: string;
  updated_at: string;
}

export const CONFIG_DEFAULTS = {
  destinatario_nombre: "Lic. Martha Beatriz Coronado Rosales",
  destinatario_puesto: "Jefa del Departamento de Servicios Escolares",
  firmante1_nombre: "Ing. Mario Mata Ontiveros",
  firmante1_puesto: "Jefe del Depto. de Actividades Extraescolares",
  firmante1_firma_url: null as string | null,
  firmante2_nombre: "Lic. Miguel Ángel Vargas Zapata",
  firmante2_puesto: "Jefe de la Oficina de Promoción Deportiva",
  firmante2_firma_url: null as string | null,
  valor_curricular: "1 crédito",
};
