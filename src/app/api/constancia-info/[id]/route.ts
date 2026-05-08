import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("constancias")
      .select("*, usuarios(nombre_completo, numero_control, carrera), periodos(nombre), talleres(nombre, categoria)")
      .eq("id", id)
      .single();

    if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const alumno = data.usuarios as { nombre_completo: string; numero_control: string | null; carrera: string | null } | null;
    const periodo = data.periodos as { nombre: string } | null;
    const taller = data.talleres as { nombre: string; categoria: string } | null;

    return NextResponse.json({
      alumno_nombre: alumno?.nombre_completo ?? "—",
      alumno_control: alumno?.numero_control ?? "—",
      alumno_carrera: alumno?.carrera ?? "—",
      taller_nombre: taller?.nombre ?? "—",
      periodo_nombre: periodo?.nombre ?? "—",
    });
  } catch (e) {
    return NextResponse.json({ error: "Error del sistema" }, { status: 500 });
  }
}
