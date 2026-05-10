"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { revalidatePath } from "next/cache";
import { CONFIG_DEFAULTS, type ConfiguracionConstancia } from "@/lib/constancias-config";

// Re-exportar para conveniencia (solo tipos, no objetos)
export type { ConfiguracionConstancia };

export async function obtenerConfiguracion(periodoId: string): Promise<ConfiguracionConstancia | null> {
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return null;
  }

  const { data } = await adminClient
    .from("configuracion_constancias")
    .select("*")
    .eq("periodo_id", periodoId)
    .single();

  return data as ConfiguracionConstancia | null;
}

export async function obtenerTodasConfiguraciones(): Promise<ConfiguracionConstancia[]> {
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return [];
  }

  const { data } = await adminClient
    .from("configuracion_constancias")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []) as ConfiguracionConstancia[];
}

export async function crearConfiguracion(formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  const periodoId = formData.get("periodo_id") as string;
  if (!periodoId) {
    return { error: "Debe seleccionar un período." };
  }

  // Verificar que el período exista
  const { data: periodo } = await adminClient
    .from("periodos")
    .select("id")
    .eq("id", periodoId)
    .single();

  if (!periodo) {
    return { error: "El período seleccionado no existe." };
  }

  // Verificar que no exista configuración para este período
  const { data: existente } = await adminClient
    .from("configuracion_constancias")
    .select("id")
    .eq("periodo_id", periodoId)
    .single();

  if (existente) {
    return { error: "Ya existe una configuración para este período." };
  }

  const { error } = await adminClient.from("configuracion_constancias").insert({
    periodo_id: periodoId,
    destinatario_nombre: (formData.get("destinatario_nombre") as string) || CONFIG_DEFAULTS.destinatario_nombre,
    destinatario_puesto: (formData.get("destinatario_puesto") as string) || CONFIG_DEFAULTS.destinatario_puesto,
    firmante1_nombre: (formData.get("firmante1_nombre") as string) || CONFIG_DEFAULTS.firmante1_nombre,
    firmante1_puesto: (formData.get("firmante1_puesto") as string) || CONFIG_DEFAULTS.firmante1_puesto,
    firmante2_nombre: (formData.get("firmante2_nombre") as string) || CONFIG_DEFAULTS.firmante2_nombre,
    firmante2_puesto: (formData.get("firmante2_puesto") as string) || CONFIG_DEFAULTS.firmante2_puesto,
    valor_curricular: (formData.get("valor_curricular") as string) || CONFIG_DEFAULTS.valor_curricular,
  });

  if (error) {
    return { error: "Error al crear la configuración: " + error.message };
  }

  revalidatePath("/admin/constancias/configuracion");
  return { success: true };
}

export async function actualizarConfiguracion(configId: string, formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  // Verificar que la configuración exista
  const { data: config } = await adminClient
    .from("configuracion_constancias")
    .select("id")
    .eq("id", configId)
    .single();

  if (!config) {
    return { error: "La configuración no existe." };
  }

  const { error } = await adminClient
    .from("configuracion_constancias")
    .update({
      destinatario_nombre: formData.get("destinatario_nombre") as string,
      destinatario_puesto: formData.get("destinatario_puesto") as string,
      firmante1_nombre: formData.get("firmante1_nombre") as string,
      firmante1_puesto: formData.get("firmante1_puesto") as string,
      firmante2_nombre: formData.get("firmante2_nombre") as string,
      firmante2_puesto: formData.get("firmante2_puesto") as string,
      valor_curricular: formData.get("valor_curricular") as string,
    })
    .eq("id", configId);

  if (error) {
    return { error: "Error al actualizar la configuración: " + error.message };
  }

  revalidatePath("/admin/constancias/configuracion");
  revalidatePath("/constancia");
  return { success: true };
}

export async function copiarConfiguracion(periodoOrigenId: string, periodoDestinoId: string) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  // Verificar que el período destino exista
  const { data: periodoDestino } = await adminClient
    .from("periodos")
    .select("id")
    .eq("id", periodoDestinoId)
    .single();

  if (!periodoDestino) {
    return { error: "El período destino no existe." };
  }

  // Verificar que no exista configuración para el período destino
  const { data: existente } = await adminClient
    .from("configuracion_constancias")
    .select("id")
    .eq("periodo_id", periodoDestinoId)
    .single();

  if (existente) {
    return { error: "Ya existe una configuración para el período destino." };
  }

  // Obtener configuración origen
  const { data: configOrigen } = await adminClient
    .from("configuracion_constancias")
    .select("*")
    .eq("periodo_id", periodoOrigenId)
    .single();

  if (!configOrigen) {
    return { error: "No existe configuración para el período origen." };
  }

  // Copiar configuración (SIN las firmas - solo textos)
  const { error } = await adminClient.from("configuracion_constancias").insert({
    periodo_id: periodoDestinoId,
    destinatario_nombre: configOrigen.destinatario_nombre,
    destinatario_puesto: configOrigen.destinatario_puesto,
    firmante1_nombre: configOrigen.firmante1_nombre,
    firmante1_puesto: configOrigen.firmante1_puesto,
    firmante2_nombre: configOrigen.firmante2_nombre,
    firmante2_puesto: configOrigen.firmante2_puesto,
    valor_curricular: configOrigen.valor_curricular,
    // Las firmas NO se copian, deben subirse nuevamente
  });

  if (error) {
    return { error: "Error al copiar la configuración: " + error.message };
  }

  revalidatePath("/admin/constancias/configuracion");
  return { success: true };
}

export async function actualizarFirmaUrl(configId: string, firmante: "1" | "2", url: string) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  const campo = firmante === "1" ? "firmante1_firma_url" : "firmante2_firma_url";

  const { error } = await adminClient
    .from("configuracion_constancias")
    .update({ [campo]: url })
    .eq("id", configId);

  if (error) {
    return { error: "Error al actualizar la firma: " + error.message };
  }

  revalidatePath("/admin/constancias/configuracion");
  revalidatePath("/constancia");
  return { success: true };
}

export async function eliminarFirma(configId: string, firmante: "1" | "2") {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  const campo = firmante === "1" ? "firmante1_firma_url" : "firmante2_firma_url";

  const { error } = await adminClient
    .from("configuracion_constancias")
    .update({ [campo]: null })
    .eq("id", configId);

  if (error) {
    return { error: "Error al eliminar la firma: " + error.message };
  }

  revalidatePath("/admin/constancias/configuracion");
  revalidatePath("/constancia");
  return { success: true };
}
