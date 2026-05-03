"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registrarAsistencia(qrData: string, tallerId: string, horasComputadas: number) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    return { error: "No autorizado." };
  }
  if (user.user_metadata?.rol !== "RESPONSABLE_TALLER") {
    return { error: "Solo los responsables de taller pueden registrar asistencia." };
  }

  if (!qrData.startsWith("tallertec:")) {
    return { error: "Código QR inválido." };
  }

  const estudianteId = qrData.replace("tallertec:", "");

  const { data: estudiante } = await supabase
    .from("usuarios")
    .select("id, nombre_completo, numero_control")
    .eq("id", estudianteId)
    .eq("activo", true)
    .single();

  if (!estudiante) {
    return { error: "Estudiante no encontrado en el sistema." };
  }

  const { data: inscripcion } = await supabase
    .from("inscripciones")
    .select("id, estado, horas_acumuladas")
    .eq("estudiante_id", estudianteId)
    .eq("taller_id", tallerId)
    .eq("estado", "ACTIVA")
    .single();

  if (!inscripcion) {
    return { error: `${estudiante.nombre_completo} no está inscrito en este taller.` };
  }

  const hoy = new Date().toISOString().split("T")[0];
  const { data: asistenciaExistente } = await supabase
    .from("asistencias")
    .select("id")
    .eq("inscripcion_id", inscripcion.id)
    .eq("fecha", hoy)
    .single();

  if (asistenciaExistente) {
    return { error: `${estudiante.nombre_completo} ya registró asistencia hoy.` };
  }

  const ahora = new Date();
  const horaEntrada = ahora.toTimeString().split(" ")[0];

  const { error } = await supabase.from("asistencias").insert({
    inscripcion_id: inscripcion.id,
    fecha: hoy,
    hora_entrada: horaEntrada,
    horas_computadas: horasComputadas,
    metodo_registro: "QR",
    registrado_por: user.id,
  });

  if (error) {
    return { error: "Error al registrar la asistencia: " + error.message };
  }

  revalidatePath("/encargado");
  return {
    success: true,
    nombreEstudiante: estudiante.nombre_completo,
    numeroControl: estudiante.numero_control,
    horasAcumuladas: Number(inscripcion.horas_acumuladas) + horasComputadas,
  };
}

export async function registrarAsistenciaManual(
  inscripcionId: string,
  horasComputadas: number,
  notas?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "RESPONSABLE_TALLER") {
    return { error: "No autorizado." };
  }

  const hoy = new Date().toISOString().split("T")[0];
  const horaEntrada = new Date().toTimeString().split(" ")[0];

  const { error } = await supabase.from("asistencias").insert({
    inscripcion_id: inscripcionId,
    fecha: hoy,
    hora_entrada: horaEntrada,
    horas_computadas: horasComputadas,
    metodo_registro: "MANUAL",
    registrado_por: user.id,
    notas,
  });

  if (error) return { error: "Error al registrar la asistencia manual." };
  revalidatePath("/encargado");
  return { success: true };
}
