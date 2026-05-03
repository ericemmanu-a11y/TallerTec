"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function inscribirTaller(tallerId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) redirect("/login");

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!usuario) {
    return { error: "Usuario no encontrado en el sistema." };
  }

  const { data: taller } = await supabase
    .from("talleres")
    .select("id, cupo_disponible, nombre")
    .eq("id", tallerId)
    .eq("activo", true)
    .single();

  if (!taller) return { error: "El taller no existe o no está disponible." };
  if (taller.cupo_disponible <= 0) return { error: "El cupo del taller está lleno." };

  const { data: existing } = await supabase
    .from("inscripciones")
    .select("id, estado")
    .eq("estudiante_id", user.id)
    .eq("taller_id", tallerId)
    .single();

  if (existing) {
    if (existing.estado === "BAJA") {
      const { error } = await supabase
        .from("inscripciones")
        .update({ estado: "ACTIVA" })
        .eq("id", existing.id);
      if (error) return { error: "Error al reactivar inscripción." };
      revalidatePath("/dashboard");
      return { success: true, tallerNombre: taller.nombre };
    }
    return { error: "Ya estás inscrito en este taller." };
  }

  const { error } = await supabase.from("inscripciones").insert({
    estudiante_id: user.id,
    taller_id: tallerId,
  });

  if (error) return { error: "No se pudo completar la inscripción. Intenta de nuevo." };

  revalidatePath("/dashboard");
  revalidatePath("/talleres");
  return { success: true, tallerNombre: taller.nombre };
}

export async function darBajaTaller(inscripcionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("inscripciones")
    .update({ estado: "BAJA" })
    .eq("id", inscripcionId)
    .eq("estudiante_id", user.id);

  if (error) return { error: "No se pudo dar de baja del taller." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function crearTaller(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const cupoMax = parseInt(formData.get("cupo_maximo") as string);

  const { error } = await supabase.from("talleres").insert({
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado." };
  }

  const { error } = await supabase
    .from("talleres")
    .update({ activo })
    .eq("id", tallerId);

  if (error) return { error: "Error al actualizar el taller." };
  revalidatePath("/admin/talleres");
  return { success: true };
}
