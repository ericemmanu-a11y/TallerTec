import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Error de configuración" }, { status: 500 });
  }

  // Verificar que el usuario sea el responsable del taller
  const { data: taller, error } = await adminClient
    .from("talleres")
    .select("id, nombre, descripcion, horario_texto, ubicacion, cupo_maximo, cupo_disponible, categoria, responsable_id")
    .eq("id", id)
    .single();

  if (error || !taller) {
    return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
  }

  if (taller.responsable_id !== user.id) {
    return NextResponse.json({ error: "No tienes permiso para ver este taller" }, { status: 403 });
  }

  // No enviar responsable_id al cliente
  const { responsable_id, ...tallerData } = taller;
  return NextResponse.json(tallerData);
}
