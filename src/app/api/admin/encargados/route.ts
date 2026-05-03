import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre_completo")
    .eq("rol", "RESPONSABLE_TALLER")
    .eq("activo", true)
    .order("nombre_completo");
  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}
