import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const { data } = await supabase
    .from("talleres")
    .select("id, nombre, horario_texto, categoria")
    .eq("responsable_id", user.id)
    .eq("activo", true)
    .order("nombre");

  return NextResponse.json(data ?? []);
}
