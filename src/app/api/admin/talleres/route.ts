import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";
import { NextResponse } from "next/server";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.rol !== "ADMIN_OFICINA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("talleres")
      .select("*, usuarios(id, nombre_completo), periodos(id, nombre)")
      .order("nombre");
    if (error) return NextResponse.json([], { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
