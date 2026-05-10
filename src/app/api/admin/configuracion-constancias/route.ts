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
      .from("configuracion_constancias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener configuraciones:", error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("Error de configuración:", e);
    return NextResponse.json([], { status: 500 });
  }
}
