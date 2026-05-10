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

export async function eliminarAsistencia(asistenciaId: string, razon?: string) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "RESPONSABLE_TALLER") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  // Obtener la asistencia y verificar que el encargado sea responsable del taller
  const { data: asistencia } = await adminClient
    .from("asistencias")
    .select("id, inscripcion_id, notas, inscripciones(taller_id, talleres(responsable_id))")
    .eq("id", asistenciaId)
    .single();

  if (!asistencia) {
    return { error: "Asistencia no encontrada." };
  }

  const inscripcion = asistencia.inscripciones as unknown as {
    taller_id: string;
    talleres: { responsable_id: string };
  };

  if (inscripcion.talleres.responsable_id !== authUser.id) {
    return { error: "No tienes permiso para eliminar esta asistencia." };
  }

  // Si hay razón, guardarla en las notas antes de eliminar (para auditoría)
  if (razon) {
    const notaActual = asistencia.notas || "";
    const nuevaNota = notaActual
      ? `${notaActual} | ELIMINADO: ${razon}`
      : `ELIMINADO: ${razon}`;

    // Primero actualizar la nota para tener registro
    await adminClient
      .from("asistencias")
      .update({ notas: nuevaNota })
      .eq("id", asistenciaId);
  }

  // Eliminar la asistencia (el trigger recalcula las horas automáticamente)
  const { error } = await adminClient
    .from("asistencias")
    .delete()
    .eq("id", asistenciaId);

  if (error) {
    return { error: "Error al eliminar la asistencia." };
  }

  revalidatePath("/encargado");
  revalidatePath("/encargado/alumnos");
  revalidatePath("/encargado/asistencias");
  return { success: true };
}

export async function editarAsistencia(
  asistenciaId: string,
  horasComputadas: number,
  razon?: string
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "RESPONSABLE_TALLER") {
    return { error: "No autorizado." };
  }

  if (horasComputadas < 0 || horasComputadas > 24) {
    return { error: "Las horas deben estar entre 0 y 24." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  // Obtener la asistencia y verificar permisos
  const { data: asistencia } = await adminClient
    .from("asistencias")
    .select("id, horas_computadas, notas, inscripcion_id, inscripciones(taller_id, talleres(responsable_id))")
    .eq("id", asistenciaId)
    .single();

  if (!asistencia) {
    return { error: "Asistencia no encontrada." };
  }

  const inscripcion = asistencia.inscripciones as unknown as {
    taller_id: string;
    talleres: { responsable_id: string };
  };

  if (inscripcion.talleres.responsable_id !== authUser.id) {
    return { error: "No tienes permiso para editar esta asistencia." };
  }

  // Construir nueva nota con historial de cambios
  const notaActual = asistencia.notas || "";
  let nuevaNota = notaActual;
  if (razon || horasComputadas !== asistencia.horas_computadas) {
    const cambio = `[${new Date().toLocaleDateString()}] Horas: ${asistencia.horas_computadas}→${horasComputadas}${razon ? ` (${razon})` : ""}`;
    nuevaNota = notaActual ? `${notaActual} | ${cambio}` : cambio;
  }

  const { error } = await adminClient
    .from("asistencias")
    .update({
      horas_computadas: horasComputadas,
      notas: nuevaNota,
    })
    .eq("id", asistenciaId);

  if (error) {
    return { error: "Error al actualizar la asistencia." };
  }

  revalidatePath("/encargado");
  revalidatePath("/encargado/alumnos");
  revalidatePath("/encargado/asistencias");
  return { success: true };
}

export async function obtenerAsistenciasSemanal(tallerId: string, fechaInicio?: string) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "RESPONSABLE_TALLER") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { error: "Error de configuración del sistema." };
  }

  // Verificar que el encargado sea responsable del taller
  const { data: taller } = await adminClient
    .from("talleres")
    .select("responsable_id")
    .eq("id", tallerId)
    .single();

  if (!taller || taller.responsable_id !== authUser.id) {
    return { error: "No tienes permiso para ver este taller." };
  }

  // Calcular fechas de la semana
  const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
  // Ajustar al lunes de la semana
  const diaSemana = inicio.getDay();
  const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicio.setDate(inicio.getDate() + diffLunes);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);

  const fechaInicioStr = inicio.toISOString().split("T")[0];
  const fechaFinStr = fin.toISOString().split("T")[0];

  // Obtener todas las inscripciones activas del taller
  const { data: inscripciones } = await adminClient
    .from("inscripciones")
    .select("id, estudiante_id, horas_acumuladas, usuarios(nombre_completo, numero_control)")
    .eq("taller_id", tallerId)
    .eq("estado", "ACTIVA");

  if (!inscripciones || inscripciones.length === 0) {
    return {
      success: true,
      alumnos: [],
      semana: { inicio: fechaInicioStr, fin: fechaFinStr }
    };
  }

  const inscripcionIds = inscripciones.map((i) => i.id);

  // Obtener asistencias de la semana
  const { data: asistencias } = await adminClient
    .from("asistencias")
    .select("id, inscripcion_id, fecha, horas_computadas, metodo_registro, notas")
    .in("inscripcion_id", inscripcionIds)
    .gte("fecha", fechaInicioStr)
    .lte("fecha", fechaFinStr);

  // Mapear datos para la respuesta
  const alumnos = inscripciones.map((insc) => {
    const usuario = insc.usuarios as unknown as { nombre_completo: string; numero_control: string };
    const asistenciasAlumno = (asistencias || []).filter((a) => a.inscripcion_id === insc.id);

    // Crear mapa de asistencias por día
    const asistenciasPorDia: Record<string, { id: string; horas: number; metodo: string; notas: string | null }> = {};
    asistenciasAlumno.forEach((a) => {
      asistenciasPorDia[a.fecha] = {
        id: a.id,
        horas: a.horas_computadas,
        metodo: a.metodo_registro,
        notas: a.notas,
      };
    });

    return {
      inscripcionId: insc.id,
      estudianteId: insc.estudiante_id,
      nombre: usuario.nombre_completo,
      numeroControl: usuario.numero_control,
      horasAcumuladas: insc.horas_acumuladas,
      asistencias: asistenciasPorDia,
      totalHorasSemana: asistenciasAlumno.reduce((sum, a) => sum + Number(a.horas_computadas), 0),
    };
  });

  return {
    success: true,
    alumnos,
    semana: { inicio: fechaInicioStr, fin: fechaFinStr },
  };
}
