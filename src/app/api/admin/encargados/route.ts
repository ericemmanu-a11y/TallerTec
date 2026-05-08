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
      .from("usuarios")
      .select("id, nombre_completo")
      .eq("rol", "RESPONSABLE_TALLER")
      .eq("activo", true)
      .order("nombre_completo");
    if (error) return NextResponse.json([], { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
