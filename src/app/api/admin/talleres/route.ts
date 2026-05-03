import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talleres")
    .select("*, usuarios(nombre_completo), periodos(nombre)")
    .order("nombre");
  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data);
}
