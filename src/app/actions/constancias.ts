"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function solicitarConstancia(periodoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const { data: totalHoras } = await supabase
    .from("inscripciones")
    .select("horas_acumuladas")
    .eq("estudiante_id", user.id)
    .eq("estado", "COMPLETADA");

  const horas = totalHoras?.reduce((acc, i) => acc + Number(i.horas_acumuladas), 0) ?? 0;

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

  const { error } = await supabase.from("constancias").insert({
    estudiante_id: user.id,
    periodo_id: periodoId,
    horas_totales: horas,
    estado: "PENDIENTE",
  });

  if (error) return { error: "Error al generar la solicitud: " + error.message };
  revalidatePath("/dashboard/constancias");
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
