"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { revalidatePath } from "next/cache";

export async function crearEncargado(formData: FormData) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const email = formData.get("email") as string;
  const nombre = formData.get("nombre_completo") as string;
  const password = formData.get("password") as string;

  // Use admin client for creating users (requires service_role key)
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Configuración incompleta. Contacta al administrador del sistema." };
  }

  const { data, error: signUpError } = await adminClient.auth.admin.createUser({
    email,
    password,
    user_metadata: { nombre_completo: nombre, rol: "RESPONSABLE_TALLER" },
    email_confirm: true,
  });

  if (signUpError || !data.user) {
    return { error: signUpError?.message ?? "Error al crear el usuario." };
  }

  // Use admin client to insert into usuarios table (bypasses RLS)
  const { error: dbError } = await adminClient.from("usuarios").insert({
    id: data.user.id,
    email,
    nombre_completo: nombre,
    rol: "RESPONSABLE_TALLER",
  });

  if (dbError) return { error: "Usuario auth creado pero error en BD: " + dbError.message };
  revalidatePath("/admin/encargados");
  return { success: true };
}

export async function toggleUsuarioActivo(usuarioId: string, activo: boolean) {
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
    .from("usuarios")
    .update({ activo })
    .eq("id", usuarioId);

  if (error) return { error: "Error al actualizar el estado del usuario." };
  revalidatePath("/admin/encargados");
  return { success: true };
}

export async function crearPeriodo(formData: FormData) {
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

  const { error } = await adminClient.from("periodos").insert({
    nombre: formData.get("nombre") as string,
    fecha_inicio: formData.get("fecha_inicio") as string,
    fecha_fin: formData.get("fecha_fin") as string,
    inscripciones_abiertas: formData.get("inscripciones_abiertas") === "true",
  });

  if (error) return { error: "Error al crear el período: " + error.message };
  revalidatePath("/admin/periodos");
  return { success: true };
}

export async function toggleInscripciones(periodoId: string, abiertas: boolean) {
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
    .from("periodos")
    .update({ inscripciones_abiertas: abiertas })
    .eq("id", periodoId);

  if (error) return { error: "Error al actualizar el período." };
  revalidatePath("/admin/periodos");
  revalidatePath("/talleres");
  return { success: true };
}

export async function marcarNotificacionLeida(notifId: string) {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "No autorizado." };

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Error de configuración del sistema." };
  }

  await adminClient
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", notifId)
    .eq("usuario_id", authUser.id);

  revalidatePath("/dashboard/notificaciones");
  return { success: true };
}

/**
 * Sincroniza el usuario autenticado con la tabla usuarios.
 * Si el usuario existe en auth.users pero no en la tabla usuarios, lo crea.
 */
export async function sincronizarUsuario() {
  const authUser = await getAuthUser();
  if (!authUser) return { error: "No autorizado." };

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: "Error de configuración del sistema." };
  }

  // Check if user already exists in usuarios table
  const { data: existingUser } = await adminClient
    .from("usuarios")
    .select("id")
    .eq("id", authUser.id)
    .single();

  if (existingUser) {
    // User already exists, nothing to do
    return { success: true, synced: false };
  }

  // Create user in usuarios table
  const { error } = await adminClient.from("usuarios").insert({
    id: authUser.id,
    email: authUser.email,
    nombre_completo: authUser.nombre_completo,
    numero_control: authUser.numero_control || null,
    carrera: authUser.carrera || null,
    semestre: authUser.semestre || null,
    telefono: authUser.telefono || null,
    rol: authUser.rol || "ESTUDIANTE",
  });

  if (error) {
    console.error("Error syncing user:", error);
    return { error: "Error al sincronizar usuario: " + error.message };
  }

  return { success: true, synced: true };
}
