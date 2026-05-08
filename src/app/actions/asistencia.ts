"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { revalidatePath } from "next/cache";

export async function registrarAsistencia(qrData: string, tallerId: string, horasComputadas: number) {
  const authUser = await getAuthUser();

  if (!authUser) {
    return { error: "No autorizado." };
  }
  if (authUser.rol !== "RESPONSABLE_TALLER") {
    return { error: "Solo los responsables de taller pueden registrar asistencia." };
  }

  if (!qrData.startsWith("tallertec:")) {
    return { error: "Código QR inválido." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Error de configuración del sistema." };
  }

  const estudianteId = qrData.replace("tallertec:", "");

  const { data: estudiante } = await adminClient
    .from("usuarios")
    .select("id, nombre_completo, numero_control")
    .eq("id", estudianteId)
    .eq("activo", true)
    .single();

  if (!estudiante) {
    return { error: "Estudiante no encontrado en el sistema." };
  }

  const { data: inscripcion } = await adminClient
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
  const { data: asistenciaExistente } = await adminClient
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

  const { error } = await adminClient.from("asistencias").insert({
    inscripcion_id: inscripcion.id,
    fecha: hoy,
    hora_entrada: horaEntrada,
    horas_computadas: horasComputadas,
    metodo_registro: "QR",
    registrado_por: authUser.id,
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
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "RESPONSABLE_TALLER") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Error de configuración del sistema." };
  }

  const hoy = new Date().toISOString().split("T")[0];
  const horaEntrada = new Date().toTimeString().split(" ")[0];

  const { error } = await adminClient.from("asistencias").insert({
    inscripcion_id: inscripcionId,
    fecha: hoy,
    hora_entrada: horaEntrada,
    horas_computadas: horasComputadas,
    metodo_registro: "MANUAL",
    registrado_por: authUser.id,
    notas,
  });

  if (error) return { error: "Error al registrar la asistencia manual." };
  revalidatePath("/encargado");
  return { success: true };
}
