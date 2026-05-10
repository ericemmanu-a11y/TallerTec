"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { revalidatePath } from "next/cache";
import { CONFIG_DEFAULTS } from "@/lib/constancias-config";

// Tipo local para evitar problemas de bundling con "use server"
interface ConfiguracionConstancia {
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

export async function obtenerConfiguracion(periodoId: string): Promise<ConfiguracionConstancia | null> {
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return null;
  }

  try {
    const { data, error } = await adminClient
      .from("configuracion_constancias")
      .select("*")
      .eq("periodo_id", periodoId)
      .single();

    if (error) {
      console.error("Error obteniendo configuración:", error.message);
      return null;
    }

    return data as ConfiguracionConstancia | null;
  } catch (e) {
    console.error("Error inesperado en obtenerConfiguracion:", e);
    return null;
  }
}

export async function obtenerTodasConfiguraciones(): Promise<ConfiguracionConstancia[]> {
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return [];
  }

  try {
    const { data, error } = await adminClient
      .from("configuracion_constancias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo todas las configuraciones:", error.message);
      return [];
    }

    return (data ?? []) as ConfiguracionConstancia[];
  } catch (e) {
    console.error("Error inesperado en obtenerTodasConfiguraciones:", e);
    return [];
  }
}

export async function crearConfiguracion(formData: FormData) {
  try {
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
    const { data: periodo, error: periodoError } = await adminClient
      .from("periodos")
      .select("id")
      .eq("id", periodoId)
      .single();

    if (periodoError || !periodo) {
      return { error: "El período seleccionado no existe." };
    }

    // Verificar que no exista configuración para este período
    const { data: existente, error: checkError } = await adminClient
      .from("configuracion_constancias")
      .select("id")
      .eq("periodo_id", periodoId)
      .single();

    // Si hay error diferente a "no rows" significa que la tabla puede no existir
    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error verificando configuración existente:", checkError);
      return { error: "Error de base de datos. Verifique que la tabla 'configuracion_constancias' exista. Ejecute la migración SQL." };
    }

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
      console.error("Error al crear configuración:", error);
      if (error.message.includes("does not exist") || error.code === "42P01") {
        return { error: "La tabla 'configuracion_constancias' no existe. Ejecute la migración SQL en Supabase." };
      }
      return { error: "Error al crear la configuración: " + error.message };
    }

    revalidatePath("/admin/constancias/configuracion");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado en crearConfiguracion:", e);
    return { error: "Error inesperado. Revise los logs del servidor." };
  }
}

export async function actualizarConfiguracion(configId: string, formData: FormData) {
  try {
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
    const { data: config, error: checkError } = await adminClient
      .from("configuracion_constancias")
      .select("id")
      .eq("id", configId)
      .single();

    if (checkError) {
      console.error("Error verificando configuración:", checkError);
      if (checkError.message.includes("does not exist") || checkError.code === "42P01") {
        return { error: "La tabla 'configuracion_constancias' no existe. Ejecute la migración SQL en Supabase." };
      }
      return { error: "Error de base de datos: " + checkError.message };
    }

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
      console.error("Error actualizando configuración:", error);
      return { error: "Error al actualizar la configuración: " + error.message };
    }

    revalidatePath("/admin/constancias/configuracion");
    revalidatePath("/constancia");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado en actualizarConfiguracion:", e);
    return { error: "Error inesperado. Revise los logs del servidor." };
  }
}

export async function copiarConfiguracion(periodoOrigenId: string, periodoDestinoId: string) {
  try {
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
    const { data: periodoDestino, error: periodoError } = await adminClient
      .from("periodos")
      .select("id")
      .eq("id", periodoDestinoId)
      .single();

    if (periodoError || !periodoDestino) {
      return { error: "El período destino no existe." };
    }

    // Verificar que no exista configuración para el período destino
    const { data: existente, error: checkError } = await adminClient
      .from("configuracion_constancias")
      .select("id")
      .eq("periodo_id", periodoDestinoId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error verificando configuración destino:", checkError);
      return { error: "Error de base de datos. Verifique que la tabla exista." };
    }

    if (existente) {
      return { error: "Ya existe una configuración para el período destino." };
    }

    // Obtener configuración origen
    const { data: configOrigen, error: origenError } = await adminClient
      .from("configuracion_constancias")
      .select("*")
      .eq("periodo_id", periodoOrigenId)
      .single();

    if (origenError || !configOrigen) {
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
      console.error("Error copiando configuración:", error);
      return { error: "Error al copiar la configuración: " + error.message };
    }

    revalidatePath("/admin/constancias/configuracion");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado en copiarConfiguracion:", e);
    return { error: "Error inesperado. Revise los logs del servidor." };
  }
}

export async function actualizarFirmaUrl(configId: string, firmante: "1" | "2", url: string) {
  try {
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
      console.error("Error actualizando firma URL:", error);
      return { error: "Error al actualizar la firma: " + error.message };
    }

    revalidatePath("/admin/constancias/configuracion");
    revalidatePath("/constancia");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado en actualizarFirmaUrl:", e);
    return { error: "Error inesperado. Revise los logs del servidor." };
  }
}

export async function eliminarFirma(configId: string, firmante: "1" | "2") {
  try {
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
      console.error("Error eliminando firma:", error);
      return { error: "Error al eliminar la firma: " + error.message };
    }

    revalidatePath("/admin/constancias/configuracion");
    revalidatePath("/constancia");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado en eliminarFirma:", e);
    return { error: "Error inesperado. Revise los logs del servidor." };
  }
}
