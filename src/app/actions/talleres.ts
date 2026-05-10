"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function inscribirTaller(tallerId: string) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");
  const user = { id: authUser.id };

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Error de configuración del sistema." };
  }

  // Check if user exists in usuarios table
  const { data: usuario } = await adminClient
    .from("usuarios")
    .select("id")
    .eq("id", user.id)
    .single();

  // If user doesn't exist, create them automatically
  if (!usuario) {
    const { error: syncError } = await adminClient.from("usuarios").insert({
      id: authUser.id,
      email: authUser.email,
      nombre_completo: authUser.nombre_completo,
      numero_control: authUser.numero_control || null,
      carrera: authUser.carrera || null,
      semestre: authUser.semestre || null,
      telefono: authUser.telefono || null,
      rol: "ESTUDIANTE",
    });

    if (syncError) {
      console.error("Error syncing user:", syncError);
      return { error: "Error al sincronizar tu cuenta. Intenta de nuevo." };
    }
  }

  const { data: taller } = await adminClient
    .from("talleres")
    .select("id, cupo_disponible, nombre")
    .eq("id", tallerId)
    .eq("activo", true)
    .single();

  if (!taller) return { error: "El taller no existe o no está disponible." };
  if (taller.cupo_disponible <= 0) return { error: "El cupo del taller está lleno." };

  const { data: existing } = await adminClient
    .from("inscripciones")
    .select("id, estado")
    .eq("estudiante_id", user.id)
    .eq("taller_id", tallerId)
    .single();

  if (existing) {
    if (existing.estado === "BAJA") {
      const { error } = await adminClient
        .from("inscripciones")
        .update({ estado: "ACTIVA" })
        .eq("id", existing.id);
      if (error) return { error: "Error al reactivar inscripción." };
      revalidatePath("/dashboard");
      return { success: true, tallerNombre: taller.nombre };
    }
    return { error: "Ya estás inscrito en este taller." };
  }

  const { error } = await adminClient.from("inscripciones").insert({
    estudiante_id: user.id,
    taller_id: tallerId,
  });

  if (error) return { error: "No se pudo completar la inscripción. Intenta de nuevo." };

  revalidatePath("/dashboard");
  revalidatePath("/talleres");
  return { success: true, tallerNombre: taller.nombre };
}

export async function darBajaTaller(inscripcionId: string) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");
  const user = { id: authUser.id };

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Error de configuración del sistema." };
  }

  const { error } = await adminClient
    .from("inscripciones")
    .update({ estado: "BAJA" })
    .eq("id", inscripcionId)
    .eq("estudiante_id", user.id);

  if (error) return { error: "No se pudo dar de baja del taller." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function crearTaller(formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Configuración incompleta." };
  }

  const cupoMax = parseInt(formData.get("cupo_maximo") as string);

  const { error } = await adminClient.from("talleres").insert({
    nombre: formData.get("nombre") as string,
    descripcion: formData.get("descripcion") as string,
    categoria: formData.get("categoria") as string,
    horario_texto: formData.get("horario_texto") as string,
    ubicacion: formData.get("ubicacion") as string,
    cupo_maximo: cupoMax,
    cupo_disponible: cupoMax,
    responsable_id: formData.get("responsable_id") as string,
    periodo_id: formData.get("periodo_id") as string,
  });

  if (error) return { error: "Error al crear el taller: " + error.message };
  revalidatePath("/admin/talleres");
  return { success: true };
}

export async function editarTaller(tallerId: string, formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Configuración incompleta." };
  }

  const { error } = await adminClient
    .from("talleres")
    .update({
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      categoria: formData.get("categoria") as string,
      horario_texto: formData.get("horario_texto") as string,
      ubicacion: formData.get("ubicacion") as string,
      responsable_id: formData.get("responsable_id") as string,
    })
    .eq("id", tallerId);

  if (error) return { error: "Error al actualizar el taller." };
  revalidatePath("/admin/talleres");
  return { success: true };
}

export async function toggleTallerActivo(tallerId: string, activo: boolean) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Configuración incompleta." };
  }

  const { error } = await adminClient
    .from("talleres")
    .update({ activo })
    .eq("id", tallerId);

  if (error) return { error: "Error al actualizar el taller." };
  revalidatePath("/admin/talleres");
  return { success: true };
}

export async function editarTallerEncargado(tallerId: string, formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "RESPONSABLE_TALLER") {
    return { error: "No autorizado." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Configuración incompleta." };
  }

  // Verificar que el encargado sea el responsable del taller
  const { data: taller } = await adminClient
    .from("talleres")
    .select("responsable_id, cupo_maximo, cupo_disponible")
    .eq("id", tallerId)
    .single();

  if (!taller) {
    return { error: "Taller no encontrado." };
  }

  if (taller.responsable_id !== authUser.id) {
    return { error: "No tienes permiso para editar este taller." };
  }

  // Validar cupo_maximo
  const nuevoCupoMaximo = parseInt(formData.get("cupo_maximo") as string);
  const inscritosActuales = taller.cupo_maximo - taller.cupo_disponible;

  if (nuevoCupoMaximo < inscritosActuales) {
    return { error: `El cupo máximo no puede ser menor a los inscritos actuales (${inscritosActuales}).` };
  }

  // Calcular nuevo cupo disponible
  const nuevoCupoDisponible = nuevoCupoMaximo - inscritosActuales;

  const { error } = await adminClient
    .from("talleres")
    .update({
      descripcion: formData.get("descripcion") as string,
      horario_texto: formData.get("horario_texto") as string,
      ubicacion: formData.get("ubicacion") as string,
      cupo_maximo: nuevoCupoMaximo,
      cupo_disponible: nuevoCupoDisponible,
    })
    .eq("id", tallerId);

  if (error) return { error: "Error al actualizar el taller." };
  revalidatePath("/encargado");
  revalidatePath("/encargado/editar/" + tallerId);
  return { success: true };
}
