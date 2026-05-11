import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// API pública para obtener talleres destacados activos (para la página principal)
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("talleres_destacados")
      .select("id, nombre, descripcion, imagen_url, color")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error obteniendo talleres destacados:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("Error:", e);
    return NextResponse.json([]);
  }
}
