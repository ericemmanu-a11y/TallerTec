"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { revalidatePath } from "next/cache";

export interface TallerDestacado {
  id: string;
  taller_id: string | null;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  color: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export async function obtenerTalleresDestacados(): Promise<TallerDestacado[]> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("talleres_destacados")
      .select("*")
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error obteniendo talleres destacados:", error);
      return [];
    }

    return (data ?? []) as TallerDestacado[];
  } catch (e) {
    console.error("Error inesperado:", e);
    return [];
  }
}

export async function obtenerTalleresDestacadosActivos(): Promise<TallerDestacado[]> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("talleres_destacados")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error obteniendo talleres destacados activos:", error);
      return [];
    }

    return (data ?? []) as TallerDestacado[];
  } catch (e) {
    console.error("Error inesperado:", e);
    return [];
  }
}

export async function crearTallerDestacado(formData: FormData) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
      return { error: "No autorizado." };
    }

    const adminClient = createAdminClient();

    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const color = formData.get("color") as string || "blue";
    const tallerIdRaw = formData.get("taller_id") as string;
    const tallerId = tallerIdRaw && tallerIdRaw !== "" ? tallerIdRaw : null;

    if (!nombre || !descripcion) {
      return { error: "Nombre y descripción son requeridos." };
    }

    // Obtener el orden máximo actual
    const { data: maxOrden } = await adminClient
      .from("talleres_destacados")
      .select("orden")
      .order("orden", { ascending: false })
      .limit(1)
      .single();

    const nuevoOrden = (maxOrden?.orden ?? -1) + 1;

    const { data, error } = await adminClient
      .from("talleres_destacados")
      .insert({
        nombre,
        descripcion,
        color,
        taller_id: tallerId,
        orden: nuevoOrden,
        activo: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creando taller destacado:", error);
      return { error: "Error al crear el taller destacado: " + error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/talleres-destacados");
    return { success: true, data };
  } catch (e) {
    console.error("Error inesperado:", e);
    return { error: "Error inesperado." };
  }
}

export async function actualizarTallerDestacado(id: string, formData: FormData) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
      return { error: "No autorizado." };
    }

    const adminClient = createAdminClient();

    const nombre = formData.get("nombre") as string;
    const descripcion = formData.get("descripcion") as string;
    const color = formData.get("color") as string || "blue";
    const tallerIdRaw = formData.get("taller_id") as string;
    const tallerId = tallerIdRaw && tallerIdRaw !== "" ? tallerIdRaw : null;
    const activo = formData.get("activo") === "true";

    if (!nombre || !descripcion) {
      return { error: "Nombre y descripción son requeridos." };
    }

    const { error } = await adminClient
      .from("talleres_destacados")
      .update({
        nombre,
        descripcion,
        color,
        taller_id: tallerId,
        activo,
      })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando taller destacado:", error);
      return { error: "Error al actualizar: " + error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/talleres-destacados");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado:", e);
    return { error: "Error inesperado." };
  }
}

export async function actualizarImagenTallerDestacado(id: string, imagenUrl: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
      return { error: "No autorizado." };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("talleres_destacados")
      .update({ imagen_url: imagenUrl })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando imagen:", error);
      return { error: "Error al actualizar la imagen: " + error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/talleres-destacados");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado:", e);
    return { error: "Error inesperado." };
  }
}

export async function eliminarTallerDestacado(id: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
      return { error: "No autorizado." };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("talleres_destacados")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando taller destacado:", error);
      return { error: "Error al eliminar: " + error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/talleres-destacados");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado:", e);
    return { error: "Error inesperado." };
  }
}

export async function reordenarTalleresDestacados(ids: string[]) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
      return { error: "No autorizado." };
    }

    const adminClient = createAdminClient();

    // Actualizar el orden de cada taller
    for (let i = 0; i < ids.length; i++) {
      await adminClient
        .from("talleres_destacados")
        .update({ orden: i })
        .eq("id", ids[i]);
    }

    revalidatePath("/");
    revalidatePath("/admin/talleres-destacados");
    return { success: true };
  } catch (e) {
    console.error("Error inesperado:", e);
    return { error: "Error inesperado." };
  }
}
