"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const NIVEL_A_VALOR: Record<string, number> = {
  INSUFICIENTE: 0, SUFICIENTE: 1, BUENO: 2, NOTABLE: 3, EXCELENTE: 4,
};

export async function solicitarConstancia(periodoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const { data: inscrCompletadas } = await supabase
    .from("inscripciones")
    .select("id, horas_acumuladas, taller_id")
    .eq("estudiante_id", user.id)
    .eq("estado", "COMPLETADA")
    .order("horas_acumuladas", { ascending: false });

  const horas = inscrCompletadas?.reduce((acc, i) => acc + Number(i.horas_acumuladas), 0) ?? 0;

  if (horas < 20) {
    return { error: `Necesitas al menos 20 horas. Tienes ${horas.toFixed(1)} horas acumuladas.` };
  }

  const { data: existente } = await supabase
    .from("constancias")
    .select("id, estado")
    .eq("estudiante_id", user.id)
    .eq("periodo_id", periodoId)
    .single();

  if (existente) {
    return { error: "Ya tienes una solicitud de constancia para este período." };
  }

  // Use the taller with most hours as the primary taller for the constancia
  const primaryTallerId = inscrCompletadas?.[0]?.taller_id ?? null;

  const { error } = await supabase.from("constancias").insert({
    estudiante_id: user.id,
    periodo_id: periodoId,
    taller_id: primaryTallerId,
    horas_totales: horas,
    estado: "PENDIENTE",
  });

  if (error) return { error: "Error al generar la solicitud: " + error.message };
  revalidatePath("/dashboard/constancias");
  return { success: true };
}

export async function evaluarConstancia(
  constanciaId: string,
  criterios: number[],   // 7 integers 0-4
  nivel: string,
  observaciones?: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "RESPONSABLE_TALLER") {
    return { error: "No autorizado." };
  }

  if (criterios.length !== 7 || criterios.some((c) => c < 0 || c > 4)) {
    return { error: "Evaluación inválida." };
  }
  if (!NIVEL_A_VALOR.hasOwnProperty(nivel)) {
    return { error: "Nivel de desempeño inválido." };
  }

  const encargadoNombre = user.user_metadata?.nombre_completo ?? user.email;

  const { error } = await supabase
    .from("constancias")
    .update({
      nivel_desempeno: nivel,
      criterios_evaluacion: criterios,
      evaluado_por_nombre: encargadoNombre,
      evaluado_en: new Date().toISOString(),
      observaciones: observaciones ?? null,
    })
    .eq("id", constanciaId);

  if (error) return { error: "Error al guardar la evaluación: " + error.message };
  revalidatePath("/encargado/alumnos");
  revalidatePath("/admin/constancias");
  return { success: true };
}

export async function aprobarConstancia(constanciaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase
    .from("constancias")
    .update({ estado: "APROBADA", generado_por: user.id })
    .eq("id", constanciaId);

  if (error) return { error: "Error al aprobar la constancia." };
  revalidatePath("/admin/constancias");
  return { success: true };
}

export async function rechazarConstancia(constanciaId: string, observaciones: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase
    .from("constancias")
    .update({ estado: "RECHAZADA", observaciones, generado_por: user.id })
    .eq("id", constanciaId);

  if (error) return { error: "Error al rechazar la constancia." };
  revalidatePath("/admin/constancias");
  return { success: true };
}

export async function marcarConstanciaEntregada(constanciaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase
    .from("constancias")
    .update({ estado: "ENTREGADA" })
    .eq("id", constanciaId);

  if (error) return { error: "Error al actualizar el estado." };
  revalidatePath("/admin/constancias");
  return { success: true };
}
