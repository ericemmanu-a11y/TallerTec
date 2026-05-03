"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearEncargado(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const email = formData.get("email") as string;
  const nombre = formData.get("nombre_completo") as string;
  const password = formData.get("password") as string;

  if (!email.endsWith("@matehuala.tecnm.mx")) {
    return { error: "El correo debe ser institucional (@matehuala.tecnm.mx)." };
  }

  const { data, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { nombre_completo: nombre, rol: "RESPONSABLE_TALLER" },
    email_confirm: true,
  });

  if (signUpError || !data.user) {
    return { error: signUpError?.message ?? "Error al crear el usuario." };
  }

  const { error: dbError } = await supabase.from("usuarios").insert({
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase
    .from("usuarios")
    .update({ activo })
    .eq("id", usuarioId);

  if (error) return { error: "Error al actualizar el estado del usuario." };
  revalidatePath("/admin/encargados");
  return { success: true };
}

export async function crearPeriodo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase.from("periodos").insert({
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase
    .from("periodos")
    .update({ inscripciones_abiertas: abiertas })
    .eq("id", periodoId);

  if (error) return { error: "Error al actualizar el período." };
  revalidatePath("/admin/periodos");
  revalidatePath("/talleres");
  return { success: true };
}

export async function marcarNotificacionLeida(notifId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", notifId)
    .eq("usuario_id", user.id);

  revalidatePath("/dashboard/notificaciones");
  return { success: true };
}
