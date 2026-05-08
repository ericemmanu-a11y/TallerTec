import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { NextResponse } from "next/server";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "RESPONSABLE_TALLER") {
    return NextResponse.json([], { status: 401 });
  }

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from("talleres")
      .select("id, nombre, horario_texto, categoria")
      .eq("responsable_id", authUser.id)
      .eq("activo", true)
      .order("nombre");

    return NextResponse.json(data ?? []);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
