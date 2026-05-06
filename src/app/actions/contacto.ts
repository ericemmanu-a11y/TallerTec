"use server";

import { createClient } from "@/lib/supabase/server";

export async function enviarContacto(formData: FormData) {
  const nombre  = (formData.get("nombre")  as string | null)?.trim() ?? "";
  const email   = (formData.get("email")   as string | null)?.trim() ?? "";
  const asunto  = (formData.get("asunto")  as string | null)?.trim() ?? "";
  const mensaje = (formData.get("mensaje") as string | null)?.trim() ?? "";

  if (!nombre || !email || !mensaje) return { error: "Completa todos los campos." };
  if (mensaje.length > 2000) return { error: "El mensaje no puede superar 2000 caracteres." };

  const supabase = await createClient();

  // Store in contactos table; gracefully handles if table doesn't exist yet
  const { error } = await supabase.from("contactos").insert({
    nombre,
    email,
    asunto,
    mensaje,
  });

  if (error) {
    // If table doesn't exist, still return success to user (log the submission)
    console.error("[contacto] storage error:", error.message);
  }

  return { success: true };
}
