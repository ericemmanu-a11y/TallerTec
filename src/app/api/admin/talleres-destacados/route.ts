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
      .from("talleres_destacados")
      .select("*")
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error obteniendo talleres destacados:", error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("Error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
